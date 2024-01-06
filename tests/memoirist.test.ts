import { Trie } from '../src'

import { describe, expect, it } from 'vitest'

const trie = new Trie()

trie.insert('/abc', '/abc')
trie.insert('/id/:id/book', 'book')
trie.insert('/id/:id/bowl', 'bowl')

trie.insert('/', '/')
trie.insert('/id/:id', '/id/:id')
trie.insert('/id/:id/abc/def', '/id/:id/abc/def')
trie.insert('/id/:id/abd/efd', '/id/:id/abd/efd')
trie.insert('/id/:id/name/:name', '/id/:id/name/:name')
trie.insert('/id/:id/name/a', '/id/:id/name/a')
trie.insert('/dynamic/:name/then/static', '/dynamic/:name/then/static')
trie.insert('/deep/nested/route', '/deep/nested/route')
trie.insert('/rest/*', '/rest/*')

describe('Raikiri', () => {
  it('match root', () => {
    expect(trie.search('/')).toEqual({
      value: '/',
      params: {},
    })
  })

  it('get path parameter', () => {
    expect(trie.search('/id/1')).toEqual({
      value: '/id/:id',
      params: {
        id: '1',
      },
    })
  })

  it('get multiple path parameters', () => {
    expect(trie.search('/id/1/name/name')).toEqual({
      value: '/id/:id/name/:name',
      params: {
        id: '1',
        name: 'name',
      },
    })
  })

  it('get deep static route', () => {
    expect(trie.search('/deep/nested/route')).toEqual({
      value: '/deep/nested/route',
      params: {},
    })
  })

  it('match wildcard', () => {
    expect(trie.search('/rest/a/b/c')).toEqual({
      value: '/rest/*',
      params: {
        '*': 'a/b/c',
      },
    })
  })

  it('handle mixed dynamic and static', () => {
    expect(trie.search('/dynamic/param/then/static')).toEqual({
      value: '/dynamic/:name/then/static',
      params: {
        name: 'param',
      },
    })
  })

  it('handle static path in dynamic', () => {
    expect(trie.search('/id/1/name/a')).toEqual({
      value: '/id/:id/name/a',
      params: {
        id: '1',
      },
    })
  })

  it('handle dynamic as fallback', () => {
    expect(trie.search('/id/1/name/ame')).toEqual({
      value: '/id/:id/name/:name',
      params: {
        id: '1',
        name: 'ame',
      },
    })
  })

  it('wildcard on root path', () => {
    const router = new Trie()

    router.insert('/a/b', 'ok')
    router.insert('/*', 'all')

    expect(router.search('/a/b/c/d')).toEqual({
      value: 'all',
      params: {
        '*': 'a/b/c/d',
      },
    })

    expect(router.search('/')).toEqual({
      value: 'all',
      params: {
        '*': '',
      },
    })
  })

  it('can overwrite wildcard', () => {
    const router = new Trie()

    router.insert('/', 'ok')
    router.insert('/*', 'all')

    expect(router.search('/a/b/c/d')).toEqual({
      value: 'all',
      params: {
        '*': 'a/b/c/d',
      },
    })

    expect(router.search('/')).toEqual({
      value: 'ok',
      params: {},
    })
  })

  it('handle trailing slash', () => {
    const router = new Trie()

    router.insert('/abc/def', 'A')
    router.insert('/abc/def/', 'A')

    expect(router.search('/abc/def')).toEqual({
      value: 'A',
      params: {},
    })

    expect(router.search('/abc/def/')).toEqual({
      value: 'A',
      params: {},
    })
  })

  it('handle static prefix wildcard', () => {
    const router = new Trie()
    router.insert('/a/b', 'ok')
    router.insert('/*', 'all')

    expect(router.search('/a/b/c/d')).toEqual({
      value: 'all',
      params: {
        '*': 'a/b/c/d',
      },
    })

    expect(router.search('/')).toEqual({
      value: 'all',
      params: {
        '*': '',
      },
    })
  })

  // ? https://github.com/SaltyAom/raikiri/issues/2
  // Migrate from mei to ei should work
  it('dynamic root', () => {
    const router = new Trie()
    router.insert('/', 'root')
    router.insert('/:param', 'it worked')

    expect(router.search('/')).toEqual({
      value: 'root',
      params: {},
    })

    expect(router.search('/bruh')).toEqual({
      value: 'it worked',
      params: {
        param: 'bruh',
      },
    })
  })

  it('handle wildcard without static fallback', () => {
    const router = new Trie()
    router.insert('/public/*', 'foo')
    router.insert('/public-aliased/*', 'foo')

    expect(router.search('/public/takodachi.png')?.params['*']).toBe('takodachi.png')
    expect(router.search('/public/takodachi/ina.png')?.params['*']).toBe('takodachi/ina.png')
  })

  it('restore mangled path', () => {
    const router = new Trie()

    router.insert('/users/:userId', '/users/:userId')
    router.insert('/game', '/game')
    router.insert('/game/:gameId/state', '/game/:gameId/state')
    router.insert('/game/:gameId', '/game/:gameId')

    expect(router.search('/game/1/state')?.value).toBe('/game/:gameId/state')
    expect(router.search('/game/1')?.value).toBe('/game/:gameId')
  })

  it('should be able to register param after same prefix', () => {
    const router = new Trie()

    router.insert('/api/abc/view/:id', '/api/abc/view/:id')
    router.insert('/api/abc/:type', '/api/abc/:type')

    expect(router.search('/api/abc/type')).toEqual({
      value: '/api/abc/:type',
      params: {
        type: 'type',
      },
    })

    expect(router.search('/api/abc/view/1')).toEqual({
      value: '/api/abc/view/:id',
      params: {
        id: '1',
      },
    })
  })

  it('use exact match for part', () => {
    const router = new Trie()

    router.insert('/api/search/:term', '/api/search/:term')
    router.insert('/api/abc/view/:id', '/api/abc/view/:id')
    router.insert('/api/abc/:type', '/api/abc/:type')

    expect(router.search('/api/abc/type')?.value).toBe('/api/abc/:type')
    expect(router.search('/api/awd/type')).toBe(undefined)
  })

  it('not error on not found', () => {
    const router = new Trie()

    router.insert('/api/abc/:type', '/api/abc/:type')

    expect(router.search('/api')).toBe(undefined)
    expect(router.search('/api/awd/type')).toBe(undefined)
  })
})
