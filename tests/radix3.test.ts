import { describe, test, expect } from 'vitest'
import { Trie } from '../src'

describe('Router lookup', () => {
  describe('static routes', () => {
    test('should be able to search static routes', () => {
      const trie = new Trie()

      trie.insert('/', 1)
      trie.insert('/route', 2)
      trie.insert('/another-router', 3)
      trie.insert('/this/is/yet/another/route', 4)

      expect(trie.search('/')).toEqual({ value: 1, params: {} })
      expect(trie.search('/route')).toEqual({ value: 2, params: {} })
      expect(trie.search('/another-router')).toEqual({ value: 3, params: {} })
      expect(trie.search('/this/is/yet/another/route')).toEqual({ value: 4, params: {} })
    })

    test('placeholders', () => {
      const trie = new Trie()

      trie.insert('carbon/:element', 1)
      trie.insert('carbon/:element/test/:testing', 2)
      trie.insert('this/:route/has/:cool/stuff', 3)

      expect(trie.search('carbon/test1')).toEqual({ value: 1, params: { element: 'test1' } })
      expect(trie.search('/carbon')).toEqual(undefined)
      expect(trie.search('carbon/')).toEqual(undefined)
      expect(trie.search('carbon/test2/test/test23')).toEqual({
        value: 2,
        params: { element: 'test2', testing: 'test23' },
      })
      expect(trie.search('this/test/has/more/stuff')).toEqual({
        value: 3,
        params: { route: 'test', cool: 'more' },
      })
    })

    test('wildcards', () => {
      // const trie = new Trie()
      // trie.insert('polymer/**:id', 1)
      // trie.insert('polymer/another/route', 2)
      // trie.insert('route/:p1/something/**:rest', 3)
      // expect(trie.search('polymer/another/route')).toEqual({ value: 2, params: {} })
      // expect(trie.search('polymer/anon')).toEqual({ value: 1, params: { id: 'anon' } })
      // expect(trie.search('polymer/foo/bar/baz')).toEqual({ value: 1, params: { id: 'foo/bar/baz' } })
      // expect(trie.search('route/param1/something/c/d')).toEqual({
      //   value: 3,
      //   params: { p1: 'param1', rest: 'c/d' },
      // })
    })

    test('unnamed placeholders', () => {
      const trie = new Trie()

      trie.insert('polymer/**', 1)
      trie.insert('polymer/route/*', 2)

      expect(trie.search('polymer/foo/bar')).toEqual({ value: 1, params: { '*': 'foo/bar' } })
      expect(trie.search('polymer/route/anon')).toEqual({ value: 2, params: { '*': 'anon' } })
      expect(trie.search('polymer/constructor')).toEqual({ value: 1, params: { '*': 'constructor' } })
    })

    // test('mixed params in same segment', () => {
    //   const trie = new Trie()

    //   trie.insert('files/:category/:id,name=:name.txt', 1)

    //   expect(trie.search('files/test/123,name=foobar.txt')).toEqual({
    //     value: 1,
    //     params: { category: 'test', id: '123', name: 'foobar' },
    //   })
    // })

    test('match routes with trailing slash', () => {
      const trie = new Trie()

      trie.insert('route/without/trailing/slash', 1)
      trie.insert('route/with/trailing/slash/', 2)
      trie.insert('route/without/trailing/slash/', 3)
      trie.insert('route/with/trailing/slash', 4)

      expect(trie.search('route/without/trailing/slash')).toEqual({ value: 1, params: {} })
      expect(trie.search('route/with/trailing/slash/')).toEqual({ value: 2, params: {} })
      expect(trie.search('route/without/trailing/slash/')).toEqual({ value: 3, params: {} })
      expect(trie.search('route/with/trailing/slash')).toEqual({ value: 4, params: {} })
    })
  })
})

// describe("Router insert", function () {
//   it("should be able to insert nodes correctly into the tree", function () {
//     const router = createRouter();
//     router.insert("hello", {});
//     router.insert("cool", {});
//     router.insert("hi", {});
//     router.insert("helium", {});
//     router.insert("/choo", {});
//     router.insert("//choo", {});
//
//     const rootNode = router.ctx.rootNode;
//     const helloNode = rootNode.children.get("hello");
//     const coolNode = rootNode.children.get("cool");
//     const hiNode = rootNode.children.get("hi");
//     const heliumNode = rootNode.children.get("helium");
//     const slashNode = rootNode.children.get("");
//
//     expect(helloNode).to.exist;
//     expect(coolNode).to.exist;
//     expect(hiNode).to.exist;
//     expect(heliumNode).to.exist;
//     expect(slashNode).to.exist;
//
//     const slashChooNode = slashNode!.children.get("choo");
//     const slashSlashChooNode = slashNode!.children
//       .get("")!
//       .children.get("choo");
//
//     expect(slashChooNode).to.exist;
//     expect(slashSlashChooNode).to.exist;
//   });
//
//   it("should insert static routes into the static route map", function () {
//     const router = createRouter();
//     const route = "/api/v2/route";
//     router.insert(route, {});
//
//     expect(router.ctx.staticRoutesMap[route]).to.exist;
//   });
//   it("should not insert variable routes into the static route map", function () {
//     const router = createRouter();
//     const routeA = "/api/v2/**";
//     const routeB = "/api/v3/:placeholder";
//     router.insert(routeA, {});
//     router.insert(routeB, {});
//
//     expect(router.ctx.staticRoutesMap[routeA]).to.not.exist;
//     expect(router.ctx.staticRoutesMap[routeB]).to.not.exist;
//   });
//
//   it("should insert placeholder and wildcard nodes correctly into the tree", function () {
//     const router = createRouter();
//     router.insert("hello/:placeholder/tree", {});
//     router.insert("choot/choo/**", {});
//
//     const helloNode = router.ctx.rootNode.children.get("hello");
//     const helloPlaceholderNode = helloNode!.children.get(":placeholder");
//     expect(helloPlaceholderNode!.type).to.equal(NODE_TYPES.PLACEHOLDER);
//
//     const chootNode = router.ctx.rootNode.children.get("choot");
//     const chootChooNode = chootNode!.children.get("choo");
//     const chootChooWildcardNode = chootChooNode!.children.get("**");
//     expect(chootChooWildcardNode!.type).to.equal(NODE_TYPES.WILDCARD);
//   });
//
//   it("should be able to initialize routes via the router contructor", function () {
//     const router = createRouter({
//       routes: {
//         "/api/v1": { value: 1 },
//         "/api/v2": { value: 2 },
//         "/api/v3": { value: 3 },
//       },
//     });
//
//     const rootSlashNode = router.ctx.rootNode.children.get("");
//     const apiNode = rootSlashNode!.children.get("api");
//     const v1Node = apiNode!.children.get("v1");
//     const v2Node = apiNode!.children.get("v2");
//     const v3Node = apiNode!.children.get("v3");
//
//     expect(v1Node).to.exist;
//     expect(v2Node).to.exist;
//     expect(v3Node).to.exist;
//     expect(v1Node!.data!.value).to.equal(1);
//     expect(v2Node!.data!.value).to.equal(2);
//     expect(v3Node!.data!.value).to.equal(3);
//   });
//
//   it("should allow routes to be overwritten by performing another insert", function () {
//     const router = createRouter({
//       routes: { "/api/v1": { data: 1 } },
//     });
//
//     let apiRouteData = router.lookup("/api/v1");
//     expect(apiRouteData!.data).to.equal(1);
//
//     router.insert("/api/v1", {
//       path: "/api/v1",
//       data: 2,
//       anotherField: 3,
//     });
//
//     apiRouteData = router.lookup("/api/v1");
//     expect(apiRouteData).deep.equal({
//       data: 2,
//       path: "/api/v1",
//       anotherField: 3,
//     });
//     expect(apiRouteData!.anotherField).to.equal(3);
//   });
// });

// describe("Router remove", function () {
//   it("should be able to remove nodes", function () {
//     const router = createRouter({
//       routes: createRoutes([
//         "hello",
//         "cool",
//         "hi",
//         "helium",
//         "coooool",
//         "chrome",
//         "choot",
//         "choot/:choo",
//         "ui/**",
//         "ui/components/**",
//       ]),
//     });
//
//     router.remove("choot");
//     expect(router.lookup("choot")).to.deep.equal(null);
//
//     expect(router.lookup("ui/components/snackbars")).to.deep.equal({
//       path: "ui/components/**",
//       params: { _: "snackbars" },
//     });
//
//     router.remove("ui/components/**");
//     expect(router.lookup("ui/components/snackbars")).to.deep.equal({
//       path: "ui/**",
//       params: { _: "components/snackbars" },
//     });
//   });
//
//   it("removes data but does not delete a node if it has children", function () {
//     const router = createRouter({
//       routes: createRoutes(["a/b", "a/b/:param1"]),
//     });
//
//     router.remove("a/b");
//     expect(router.lookup("a/b")).to.deep.equal(null);
//     expect(router.lookup("a/b/c")).to.deep.equal({
//       params: { param1: "c" },
//       path: "a/b/:param1",
//     });
//   });
//
//   it("should be able to remove placeholder routes", function () {
//     const router = createRouter({
//       routes: createRoutes(["placeholder/:choo", "placeholder/:choo/:choo2"]),
//     });
//
//     expect(router.lookup("placeholder/route")).to.deep.equal({
//       path: "placeholder/:choo",
//       params: {
//         choo: "route",
//       },
//     });
//
//     // TODO
//     // router.remove('placeholder/:choo')
//     // expect(router.lookup('placeholder/route')).to.deep.equal(null)
//
//     expect(router.lookup("placeholder/route/route2")).to.deep.equal({
//       path: "placeholder/:choo/:choo2",
//       params: {
//         choo: "route",
//         choo2: "route2",
//       },
//     });
//   });
//
//   it("should be able to remove wildcard routes", function () {
//     const router = createRouter({
//       routes: createRoutes(["ui/**", "ui/components/**"]),
//     });
//
//     expect(router.lookup("ui/components/snackbars")).to.deep.equal({
//       path: "ui/components/**",
//       params: { _: "snackbars" },
//     });
//     router.remove("ui/components/**");
//     expect(router.lookup("ui/components/snackbars")).to.deep.equal({
//       path: "ui/**",
//       params: { _: "components/snackbars" },
//     });
//   });
//
//   it("should return a result signifying that the remove operation was successful or not", function () {
//     const router = createRouter({
//       routes: createRoutes(["/some/route"]),
//     });
//
//     let removeResult = router.remove("/some/route");
//     expect(removeResult).to.equal(true);
//
//     removeResult = router.remove("/some/route");
//     expect(removeResult).to.equal(false);
//
//     removeResult = router.remove("/some/route/that/never/existed");
//     expect(removeResult).to.equal(false);
//   });
// });
