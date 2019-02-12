import express from 'express'
import fs from 'fs'
import path from 'path'
import { isEmpty } from 'lodash'
import { getModality, parseHeader, parseHeaderFromFile } from '../common'
import { parse, HTMLElement, Node, TextNode } from 'node-html-parser'

const nodeMatches = (condition: RegExp) => (node: Node) => condition.test(node.rawText)
const childrenContainsDefinitionText = (condition: RegExp) => (node: Node): boolean => node.childNodes.some(nodeMatches(condition))
const emptyNode = (node: Node) => node.rawText.trim() === ''

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

export default (folderRoot: string) => {
    let router = express.Router()

    const afterDefinition = trimLeft(/definition/)

    router.get('/:modality/:file', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const {
            modality,
            file
        } = req.params;

        fs.readFile(path.join(folderRoot, modality, file), (err, data) => {
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

    const filepath = (req: express.Request, modality: string, filename: string) => resolved(req, `rx/file/${modality}/${filename}`)

    router.get('/:modality/:file/info', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const {
            modality,
            file
        } = req.params;

        fs.readFile(path.join(folderRoot, modality, file), async (err, data) => {
            if (err) {
                next(err)
            }

            const interestingNode = await parseHeader(data)

            const [
                version,
                _,
                tag,
                name,
                category
            ] = interestingNode;

            res.send({
                modality: modality,
                filename: file,
                filepath: filepath(req, modality, file),
                version: version,
                tag: tag,
                name: name,
                category: category
            })
        })
    });

    const getListing: express.RequestHandler = (req, res, next) => {
        const {
            modality
        } = req.params;

        let p: string;

        p = path.join(folderRoot, modality)

        fs.readdir(p, (err, items) => {
            if (err) {
                return next(err)
            }

            res.locals.listing = items
            next()
        })
    }

    router.get('/:modality', getListing, async (req: express.Request, res: express.Response) => {
        const {
            modality
        } = req.params

        const meta = await Promise.all(res.locals.listing
            .map(async (filename: string) => ({
                filename: filename,
                filepath: filepath(req, modality, filename),
                info: await parseHeaderFromFile(path.join(folderRoot, modality, filename)),
            })))

        const empty = meta.filter((infoObject: any) => isEmpty(infoObject.info) || Object.values(infoObject.info).some(val => typeof val === 'undefined'))

        res.send({
            modality: {
                code: modality,
                ...getModality(modality)
            },
            meta: meta,
            empty: empty
        })
    })

    return router
}