enum UNICODE {
  ZERO = 48,
  NINE = 57,
  A = 65,
  z = 122,
  FORWARD_SLASH = 47,
  COLON = 58,
  ASTERISK = 42,
}

enum CHARACTERS {
  FORWARD_SLASH = '/',
  COLON = ':',
  ASTERISK = '*',
}

interface TrieNode<T> {
  value?: T
  paramName?: string
  isWord?: boolean
  children?: Record<string, TrieNode<T>>
  param?: TrieNode<T>
  wildcard?: TrieNode<T>
}

interface TrieResult<TValue, TParams extends Record<string, any> = Record<string, any>> {
  value?: TValue
  params: TParams
}

export class Trie<T> {
  static hasSpecialCharacter(key: string): boolean {
    return key.includes(CHARACTERS.COLON) || key.includes(CHARACTERS.ASTERISK)
  }

  root: Record<string, TrieNode<T>> = {}

  insert(key: string, value?: any): void {
    if (!Trie.hasSpecialCharacter(key)) {
      this.root[key] = { value }
      return
    }

    let i = 0
    let seekingWildcard = 0
    let seekingParam = false
    let paramName = ''
    let characterCode = key.charCodeAt(i++)
    let node = (this.root[characterCode] ??= {})

    for (; i < key.length; i++) {
      characterCode = key.charCodeAt(i)

      if (seekingParam) {
        if (
          characterCode < UNICODE.ZERO ||
          characterCode > UNICODE.z ||
          (characterCode > UNICODE.NINE && characterCode < UNICODE.A)
        ) {
          node.paramName = paramName
          seekingParam = false
        } else {
          paramName += String.fromCharCode(characterCode)
          continue
        }
      }

      if (seekingWildcard) {
      }

      if (characterCode === UNICODE.COLON) {
        seekingParam = true
        paramName = ''
        node.param ??= {}
        node = node.param

        continue
      }

      if (characterCode === UNICODE.ASTERISK) {
        node.value = value
        node.paramName = CHARACTERS.ASTERISK
        node.isWord = true
        node.wildcard ??= {}
        node = node.wildcard

        return
      }

      node.children ??= {}
      node = node.children[characterCode] ??= {}
    }

    node.value = value
    node.isWord = true
    if (seekingParam) {
      node.paramName = paramName
    }
  }

  search(key: string): TrieResult<T> | undefined {
    const earlyResult = this.root?.[key]

    if (earlyResult) {
      return { value: earlyResult.value, params: {} }
    }

    const startNode = this.root[key.charCodeAt(0)]

    if (!startNode) {
      return
    }

    return this.searchFrom(key, startNode, 1)
  }

  searchFrom(
    key: string,
    startNode: TrieNode<T>,
    index = 0,
    previousCharacterCode?: number,
  ): TrieResult<T> | undefined {
    let i = index

    let currentNode: TrieNode<T> = startNode
    let nextNode: TrieNode<T> | undefined
    let wildcardNode: TrieNode<T> | undefined
    let paramNode: TrieNode<T> | undefined

    let seekingWildcard = 0
    let seekingParam = previousCharacterCode === UNICODE.COLON || previousCharacterCode === UNICODE.ASTERISK
    let paramName = currentNode.paramName ?? ''
    let paramValue = ''

    const params: TrieResult<T>['params'] = {}

    for (; i < key.length; i++) {
      const characterCode = key.charCodeAt(i)

      if (seekingParam) {
        if (
          characterCode < UNICODE.ZERO ||
          characterCode > UNICODE.z ||
          (characterCode > UNICODE.NINE && characterCode < UNICODE.A)
        ) {
          params[paramName] = paramValue
          seekingParam = false
        } else {
          paramValue += String.fromCharCode(characterCode)
          continue
        }
      }

      if (seekingWildcard) {
      }

      nextNode = currentNode.children?.[characterCode]
      paramNode = currentNode.param
      wildcardNode = currentNode.wildcard

      if (nextNode) {
        if (paramNode || wildcardNode) {
          return this.depthFirstSearch(key, i, params, currentNode, nextNode)
        } else {
          currentNode = nextNode
          continue
        }
      }

      if (paramNode) {
        currentNode = paramNode
        paramName = currentNode.paramName ?? ''
        paramValue = String.fromCharCode(characterCode)
        seekingParam = true

        continue
      }

      if (wildcardNode) {
        params[CHARACTERS.ASTERISK] = key.slice(i)
        return { params, value: currentNode.value }
      }
      return
    }

    if (currentNode.wildcard) {
      params[CHARACTERS.ASTERISK] = key.slice(i)
      return { params, value: currentNode.value }
    }

    if (seekingParam) {
      params[paramName] = paramValue
    }

    return currentNode.isWord ? { value: currentNode.value, params } : undefined
  }

  depthFirstSearch(
    key: string,
    index: number,
    params: TrieResult<T>['params'],
    currentNode: TrieNode<T>,
    nextNode: TrieNode<T>,
  ): TrieResult<T> | undefined {
    let result: TrieResult<T> | undefined

    if ((result = this.searchFrom(key, nextNode, index + 1))) {
      Object.assign(result.params, params)
      return result
    }

    if (currentNode.param) {
      result = this.searchFrom(key, currentNode.param, index, UNICODE.COLON)
      if (result) {
        Object.assign(result.params, params)
        return result
      }
    }

    if (currentNode.wildcard) {
      result = this.searchFrom(key, currentNode.wildcard, index, UNICODE.ASTERISK)
      if (result) {
        Object.assign(result.params, params)
        return result
      }
    }
  }
}
