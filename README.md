<h1 align="center">
  <br>
	<img width="320" src="media/logo.png" alt="llpage">
  <br>
  <br>
  <br>
</h1>

> 🚀 page operation model (in memory) with LRU & lifecycle strategy.

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg)](#contributors) ![Travis (.org) branch](https://img.shields.io/travis/qddegtya/llpage/master.svg) [![Coverage Status](https://coveralls.io/repos/github/qddegtya/llpage/badge.svg?branch=master)](https://coveralls.io/github/qddegtya/llpage?branch=master) ![npm](https://img.shields.io/npm/v/llpage.svg) [![Known Vulnerabilities](https://snyk.io/test/github/qddegtya/llpage/badge.svg)](https://snyk.io/test/github/qddegtya/llpage)

* Docs
  * [Motivation](./docs/motivation.md)
  * [Principle](./docs/principle.md)
  * [Api](./docs/api.md)

# Install

```
$ npm install llpage
```

# Feature

* ⚙️ Support `keep-alive` in memory(LRU)
* 🚀 High-Performance page operator with Doubly Linked List(DLL)
* 💗 Elegant api such as `open`/`close`/`closeAll`/`refresh`/`closeOthers`
* 👀 reactive inside
* 📱 Support page lifecyle (sync/async)

# Example

```javascript
import { createLLPageManager, createPage } from 'llpage'

const testPage = createPage({
  data: {},

  async onCreate() {
    await xx()
  }

  async onStart() {
    await xx()
  }
})

const ll = createLLPageManager({
  size: 10
})

////////// some page op //////////
ll.open(testPage)
ll.close(testPage)
ll.closeOthers(testPage)
ll.closeAll()
```

# Real-World Example

|name|description|homepage|
|:--|:--|:--|
|example|simple examples inside this repo|[view](./examples/README.md)|

# Awesome list

|name|description|homepage|
|:--|:--|:--|
|Rice|📦 out-of-box micro-frontends solution|[view](https://github.com/qddegtya/rice)|

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/all-contributors/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/773248?v=4" width="100px;" alt="Archer (炽宇)"/><br /><sub><b>Archer (炽宇)</b></sub>](http://xiaoa.name)<br />[💻](https://github.com/qddegtya/llpage/commits?author=qddegtya "Code") [🚇](#infra-qddegtya "Infrastructure (Hosting, Build-Tools, etc)") [🚧](#maintenance-qddegtya "Maintenance") [🎨](#design-qddegtya "Design") [📖](https://github.com/qddegtya/llpage/commits?author=qddegtya "Documentation") |
| :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
