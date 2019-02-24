import express from 'express'
import fs from 'fs'
import path from 'path'
import { isEmpty } from 'lodash'
import { Header, getModality, parseHeaderFromFile } from '../common'
import { parse, HTMLElement, Node, TextNode } from 'node-html-parser'

const nodeMatches = (condition: RegExp) => (node: Node) => condition.test(node.rawText)
const childrenContainsDefinitionText = (condition: RegExp) => (node: Node): boolean => node.childNodes.some(nodeMatches(condition))
const emptyNode = (node: Node) => node.rawText.trim() === ''

export const getFileInfo: (a: string, b: string, l: string[]) => Promise<{ filename: string, header: Header }[]> = (absoluteFilePath: string, modality: string, listing: string[]) => {
    const promises = listing.map(async (filename: string) => ({
        filename: filename.slice(),
        header: parseHeaderFromFile(path.join(absoluteFilePath, modality, filename)),
    }))
    return Promise.all(promises)
}

export const getListing = (absoluteFilePath: string, modality: string) => new Promise<string[]>((resolve, reject) => {
    fs.readdir(path.join(absoluteFilePath, modality), (err, items) => {
        if (err) {
            return reject(err)
        }
        resolve(items)
    })
})

const addModalityListingToLocals: (absoluteFilePath: string) => express.RequestHandler = (absoluteFilePath: string) => async (req, res, next) => {
    const {
        modality
    } = req.params;

    try {
        const listing = await getListing(absoluteFilePath, modality)
        res.locals.listing = listing
        next()
    } catch (e) {
        next(e)
        return
    }
}

const trimEmptyNodes = (root: Node): Node | undefined => {
    if (root.childNodes.length === 0) {
        if (!emptyNode(root)) {
            return root
        } else {
            return
        }
    }

    if (root.childNodes.every(n => emptyNode(n))) {
        root.childNodes = []
    } else {
        const trimmedNodes = root.childNodes.map(trimEmptyNodes)
        root.childNodes = trimmedNodes.filter(n => typeof n !== 'undefined')
    }

    return root
}

const trimConsecutive = (childNodes: Node[], tag: string = "BR", maxConsecutive: number = 3): Node[] => {
    if (childNodes.length === 0) {
        return childNodes
    }

    let i = 0;

    return childNodes.reduce((newNodeList, curr) => {
        if (curr instanceof HTMLElement) {
            if (curr.tagName === tag) {
                if (i >= maxConsecutive) {
                    return newNodeList
                } else {
                    ++i
                }
            } else {
                i = 0
            }
        } else {
            i = 0
        }

        newNodeList.push(curr)

        return newNodeList
    }, []);
}

const trimLeft = (condition: RegExp) => {
    const contains = nodeMatches(condition)
    const childrenContains = childrenContainsDefinitionText(condition)

    return (root: Node): Node | undefined => {
        if (root instanceof TextNode) {
            if (contains(root) || childrenContains(root)) {
                return root;
            }
        } else {
            const body = root as HTMLElement;

            if (body.childNodes.length === 0 && contains(body)) {
                console.log('found text: ', body.text)
                return body;
            }

            // prune children
            const answers: boolean[] = body.childNodes.map(n => contains(n) || childrenContains(n))

            const first = answers.findIndex(v => v)

            if (first) {
                // add the body text
                const newChildren = body.childNodes.slice(first)
                body.childNodes = newChildren
                return trimEmptyNodes(body);
            }

            console.dir(body.childNodes)

            return body;
        }
    }
}

export default (options: { endpoint: string, absoluteFilePath: string, trimLeftPattern?: RegExp }) => {
    let router = express.Router()

    const afterDefinition = options.trimLeftPattern ? trimLeft(options.trimLeftPattern) : (_: any) => _

    router.get('/:modality/:file', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const {
            modality,
            file
        } = req.params;

        fs.readFile(path.join(options.absoluteFilePath, modality, file), (err, data) => {
            if (err) {
                next(err)
                return
            }

            const root = parse(data.toString(), { noFix: false })

            const body = root.childNodes.find(node => node instanceof HTMLElement)

            res.type('html')
            const formattedBoy = afterDefinition(body)
            formattedBoy.childNodes = trimConsecutive(formattedBoy.childNodes)
            res.send(formattedBoy.toString())
        })
    });

    function resolved(req: express.Request, endpoint: string): ({ relative: string, absolute: string }) {
        return {
            relative: endpoint,
            absolute: `${req.protocol}://${req.headers.host}/${endpoint}`
        };
    }

    const filepath = (req: express.Request, modality: string, filename: string) => resolved(req, `${options.endpoint}/file/${modality}/${filename}`)

    router.get('/:modality/:file/info', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const {
            modality,
            file
        } = req.params;

        const filePath = path.join(options.absoluteFilePath, modality, file)

        try {
            const {
                version,
                tag,
                name,
                category
            } = parseHeaderFromFile(filePath)

            res.send({
                modality: modality,
                filename: file,
                filepath: filepath(req, modality, file),
                version: version,
                tag: tag,
                name: name,
                category: category
            })
        } catch (e) {
            next(e)
        }
    });

    router.get('/:modality', addModalityListingToLocals(options.absoluteFilePath), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const {
            modality
        } = req.params

        try {
            const meta = (await getFileInfo(options.absoluteFilePath, modality, res.locals.listing))
                .map(x => ({ filepath: filepath(req, modality, x.filename), ...x}))

            const empty = meta.filter((infoObject) => isEmpty(infoObject.header) || Object.values(infoObject.header).some(val => typeof val === 'undefined'))

            res.send({
                modality: {
                    code: modality,
                    ...getModality(modality)
                },
                meta: meta,
                empty: empty
            })

        } catch (e) {
            next(e)
        }
    })

    return router
}