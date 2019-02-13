/**
 * 
 * 
 * Usage:
 * 
 * import { createLLPageManager, createPage } from 'llpage'
 * 
 * const ll = createLLPageManager({
 *   size: 10
 * })
 * 
 * // userPage.js
 * const page = createPage({
 *   data: {
 *   },
 * 
 *   onResume () {},
 *   onXXX () {},
 * 
 *   ...YOUR_CUSTOM_METHODS
 * })
 * 
 * // open page
 * ll.open(page)
 * 
 * // close page
 * ll.close(page)
 * 
 * // close all pages
 * ll.closeAll()
 * 
 * // close others
 * ll.closeOthers(page)
 * 
 * 
 */

import LLPageManager from './LLPageManager'
import Page from './Page'
import host from './host'

const createPage = (opts) => {
  return new Page(host.uuid++, opts)
}

const createLLPageManager = (opts) => {
  return new LLPageManager(opts)
}

export {
  createPage,
  createLLPageManager
}
