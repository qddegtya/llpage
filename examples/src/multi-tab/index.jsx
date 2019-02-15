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

console.dir(ll);

const mockData = [
  {
    title: "淘宝网",
    url: "https://taobao.com"
  },
  {
    title: "国际站",
    url: "https://alibaba.com"
  },
  {
    title: "1688",
    url: "https://1688.com"
  },
  {
    title: "天猫",
    url: "https://tmall.com"
  },
  {
    title: "聚划算",
    url: "https://ju.taobao.com"
  },
  {
    title: "阿里云",
    url: "https://aliyun.com"
  }
];

const _createPage = (title, url) => ({
  data: {
    title,
    url
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
    this.mountNode.style.zIndex = -1;
    this.mountNode.style.transform = "translate3d(0, -200%, 0)";
    this.mountNode.style.transition = "transform 1s ease";

    this.rootNode.appendChild(this.mountNode);
  },

  onStart() {
    console.log(`page: ${this.id} 将被启动`);
    // this.mountNode.style.display = "block";
    this.mountNode.style.transform = "translate3d(0, 0, 0)";
    this.mountNode.style.zIndex = 10;

    // 开始挂载真正的内容
    const iframeNode = document.createElement("iframe");
    iframeNode.style.border = 0;
    (iframeNode.style.width = "100%"), (iframeNode.style.height = "100%");

    iframeNode.src = this.data.url;

    this.mountNode.appendChild(iframeNode);
  },

  onPause() {
    console.log(`page ${this.id} 被暂停`);

    // this.mountNode.style.display = "none";
    this.mountNode.style.transform = "translate3d(0, -200%, 0)";
    this.mountNode.style.zIndex = -1;
  },

  onResume() {
    console.log(`page ${this.id} 重新激活`);

    // this.mountNode.style.display = "block";
    this.mountNode.style.transform = "translate3d(0, 0, 0)";
    this.mountNode.style.zIndex = 10;
  },

  onStop() {
    console.log(`page ${this.id} 停止`);

    this.mountNode.style.transform = "translate3d(0, -200%, 0)";
    this.mountNode.style.zIndex = -1;
    // this.mountNode.style.display = "none";
  },

  onDestroy() {
    console.log(`page ${this.id} 将被销毁`);

    // 销毁自己
    this.rootNode.removeChild(this.mountNode);
  },

  onRestart() {
    console.log(`page ${this.id} 重启`);

    this.rootNode = document.getElementById("main");

    // 创建挂载点
    this.mountNode = document.createElement("div");
    this.mountNode.id = `page-${this.id}`;
    this.mountNode.style.position = "absolute";
    this.mountNode.style.width = "100%";
    this.mountNode.style.left = 0;
    this.mountNode.style.top = 0;
    this.mountNode.style.zIndex = -1;
    this.mountNode.style.transform = "translate3d(0, -200%, 0)";
    this.mountNode.style.transition = "transform 1s ease";

    this.rootNode.appendChild(this.mountNode);
  }
});

const pages = mockData.map(i => createPage(_createPage(i.title, i.url)));

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
          backgroundColor: "#f9f9f9",
          position: "relative",
          zIndex: 999999
        }}
      >
        {this.props.dataSrc.reverse().map((i, idx) => (
          <TabBar.Item title={i.title} active key={idx} />
        ))}
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

const Button = props => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        padding: "10px 0",
        justifyContent: "center",
        alignItems: "center",
        color: "#ffffff",
        backgroundColor: "#0984e3",
        marginBottom: "10px",
        borderRadius: "9999px",
        fontSize: "16px",
        lineHeight: "16px",
        cursor: "pointer"
      }}
      onClick={props.onClick}
    >
      <span>{props.title}</span>
    </div>
  );
};

class MultiTabExample extends Component {
  constructor() {
    super();

    this.state = {
      openedTabs: [],
      activeIdx: -1
    };
  }

  _openPage(page) {
    this.setState(
      {
        openedTabs: [
          {
            title: page.data.title,
            url: page.data.url
          }
        ].concat(this.state.openedTabs)
      },
      () => {
        ll.open(page);
      }
    );
  }

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
            borderRight: "1px solid #f0f0f0",
            padding: "10px",
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              boxSizing: "border-box",
              marginBottom: "20px",
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: "10px"
            }}
          >
            <h1
              style={{
                margin: 0,
                padding: 0,
                fontSize: "32px",
                lineHeight: "32px",
                color: "#333333",
                marginBottom: "10px",
                borderLeft: "5px solid #f0f0f0",
                paddingLeft: "14px"
              }}
            >
              {`LLPage`}
            </h1>
            <h3
              style={{
                margin: 0,
                padding: 0,
                fontSize: "12px",
                lineHeight: "12px",
                color: "#999999"
              }}
            >
              {`🚀 example - multi-tab`}
            </h3>
          </div>
          <div>
            {mockData.map((i, idx) => {
              return (
                <Button
                  title={i.title}
                  onClick={() => {
                    // pass
                    this._openPage(pages[idx]);
                  }}
                  key={idx}
                />
              );
            })}
          </div>
        </div>

        {/* top tab bar */}
        <div
          style={{
            marginLeft: "200px"
          }}
        >
          <TabBar
            dataSrc={this.state.openedTabs}
            activeIdx={this.state.activeIdx}
          />

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
    this._openPage(pages[0]);

    // console.log("<====== 新建三个窗口 ======>");
    // ll.open(page1);
    // await sleep(5000);
    // ll.open(page2);
    // await sleep(5000);
    // ll.open(page3);
    // console.log("<====== 激活窗口 1 ======>");
    // await sleep(5000);
    // ll.open(page1);
    // console.log("<====== 关闭窗口 3 ======>");
    // await sleep(5000);
    // ll.close(page3);
    // console.log("<====== 关闭窗口 2 之外的窗口 ======>");
    // await sleep(5000);
    // ll.closeOthers(page2);
    // console.log("<====== 全部关闭 ======>");
    // await sleep(5000);
    // // ll.closeAll();
  }
}

ReactDOM.render(<MultiTabExample />, document.getElementById("example"));
