import { describe, test, expect } from 'vitest'
import { Trie } from '../src/index'

describe('Trie', () => {
  test('prioritizes concrete routes over params', () => {
    const trie = new Trie()

    // Route that ends with anything as a param.
    trie.insert('/a/:b/:c/:d')

    // Route that explicitly ends with "d".
    trie.insert('/a/:b/:c/d')

    const b = 'param1'
    const c = 'param2'
    const d = 'param3'

    expect(trie.search(`/a/${b}/${c}/d`)).toEqual({ params: { b, c } })
    expect(trie.search(`/a/${b}/${c}/${d}`)).toEqual({ params: { b, c, d } })
  })

  test('backtracks if explicit route leads to invalid', () => {
    const trie = new Trie()

    trie.insert('/a/:b/:c')

    // Route that explicitly starts with /a/b and will be prioritized over /a/:b .
    trie.insert('/a/b/:c/d')

    const b = 'param1'
    const c = 'param2'

    // Attempt to match /a/:b/:c/d first, then fail and fallback to /a/:b/:c .
    expect(trie.search(`/a/${b}/${c}`)).toEqual({ params: { b, c } })
  })
})
