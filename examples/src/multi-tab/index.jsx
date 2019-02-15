import React, { Component } from "react";
import ReactDOM from "react-dom";
import { createPage, createLLPageManager } from "llpage";

const sleep = ms => {
  return new Promise((a, b) => {
    setTimeout(a, ms);
  });
};

const ll = createLLPageManager({
  size: 5
});

const options = {
  data: {
    "page-1": "https://taobao.com",
    "page-2": "https://alibaba.com",
    "page-3": "https://1688.com"
  },

  onCreate() {
    console.log(`page: ${this.id} 将被创建`);

    this.rootNode = document.getElementById("main");

    // 创建挂载点
    this.mountNode = document.createElement("div");
    this.mountNode.id = `page-${this.id}`;
    this.mountNode.style.position = "absolute";
    this.mountNode.style.width = "100%";
    this.mountNode.style.left = 0;
    this.mountNode.style.top = 0;
    this.mountNode.style.transform = "translate3d(0, -200%, 0)";
    this.mountNode.style.transition = "transform 1s ease";

    this.rootNode.appendChild(this.mountNode);
  },

  onStart() {
    console.log(`page: ${this.id} 将被启动`);
    // this.mountNode.style.display = "block";
    this.mountNode.style.transform = "translate3d(0, 0, 0)";

    // 开始挂载真正的内容
    const iframeNode = document.createElement("iframe");
    iframeNode.style.border = 0;
    (iframeNode.style.width = "100%"), (iframeNode.style.height = "100%");

    iframeNode.src = this.data[`page-${this.id}`];

    this.mountNode.appendChild(iframeNode);
  },

  onPause() {
    console.log(`page ${this.id} 被暂停`);

    // this.mountNode.style.display = "none";
    this.mountNode.style.transform = "translate3d(0, -200%, 0)";
  },

  onResume() {
    console.log(`page ${this.id} 重新激活`);

    // this.mountNode.style.display = "block";
    this.mountNode.style.transform = "translate3d(0, 0, 0)";
  },

  onStop() {
    console.log(`page ${this.id} 停止`);

    this.mountNode.style.transform = "translate3d(0, -200%, 0)";
    // this.mountNode.style.display = "none";
  },

  onDestroy() {
    console.log(`page ${this.id} 将被销毁`);

    // 销毁自己
    this.rootNode.removeChild(this.mountNode);
  },

  onRestart() {
    console.log(`page ${this.id} 重启`);
  }
};

const page1 = createPage(options);
const page2 = createPage(options);
const page3 = createPage(options);

console.dir(ll);

class TabBar extends Component {
  render() {
    return (
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingTop: "5px",
          borderBottom: "1px solid #f9f9f9",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#f9f9f9"
        }}
      >
        <TabBar.Item title={"测试标题"} active />
        <TabBar.Item title={"测试标题"} />
        <TabBar.Item title={"测试标题"} />
        <TabBar.Item title={"测试标题"} />
      </div>
    );
  }
}

TabBar.Item = class Item extends Component {
  render() {
    const { active, title } = this.props;

    return (
      <div
        style={{
          padding: "2px 25px",
          boxSizing: "border-box",
          backgroundColor: active ? "#0984e3" : "#f0f0f0",
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginRight: "1px",
          overflow: "hidden"
        }}
      >
        <span
          style={{
            fontSize: "14px"
          }}
        >
          {title}
        </span>
      </div>
    );
  }
};

TabBar.Item.defaultProps = {
  active: false
};

class MultiTabExample extends Component {
  render() {
    return (
      <div>
        {/* side bar */}
        <div
          style={{
            width: "200px",
            height: "100%",
            position: "absolute",
            left: 0,
            top: 0,
            backgroundColor: "#f9f9f9",
            borderRight: "1px solid #f0f0f0"
          }}
        >
          <div />
        </div>

        {/* top tab bar */}
        <div
          style={{
            marginLeft: "200px"
          }}
        >
          <TabBar />

          {/* main 区域 */}
          <div
            id="main"
            style={{
              position: "relative",
              height: "100%",
              width: "100%"
            }}
          />
        </div>
      </div>
    );
  }

  async componentDidMount() {
    console.log("<====== 新建三个窗口 ======>");

    ll.open(page1);

    await sleep(5000);
    ll.open(page2);

    await sleep(5000);
    ll.open(page3);

    console.log("<====== 激活窗口 1 ======>");

    await sleep(5000);
    ll.open(page1);

    console.log("<====== 关闭窗口 3 ======>");

    await sleep(5000);
    ll.close(page3);

    console.log("<====== 关闭窗口 2 之外的窗口 ======>");

    await sleep(5000);
    ll.closeOthers(page2);

    console.log("<====== 全部关闭 ======>");

    await sleep(5000);
    // ll.closeAll();
  }
}

ReactDOM.render(<MultiTabExample />, document.getElementById("example"));
