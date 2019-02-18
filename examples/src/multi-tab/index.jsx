import React, { Component } from "react";
import ReactDOM from "react-dom";
import { createPage, createLLPageManager } from "llpage";

const sleep = ms => {
  return new Promise((a, b) => {
    setTimeout(a, ms);
  });
};

const _logToConsole = msg => {
  const consolePannel = document.getElementById("consolep");
  const consolePannelScroller = document.getElementById("consolep-scroll");

  const _msgEle = document.createElement("div");

  _msgEle.innerHTML = `<span style="font-size: 12px;line-height: 16px;color: #ffffff">${msg}</span>`;

  consolePannel.appendChild(_msgEle);
  consolePannelScroller.scrollTop = consolePannelScroller.scrollHeight;
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
    _logToConsole(`page: ${this.id} 将被创建`);

    this.rootNode = document.getElementById("main");

    // 创建挂载点
    this.mountNode = document.createElement("div");
    this.mountNode.id = `page-${this.id}`;
    this.mountNode.style.position = "absolute";
    this.mountNode.style.width = "100%";
    this.mountNode.style.left = 0;
    this.mountNode.style.top = 0;
    this.mountNode.style.zIndex = -1;
    this.mountNode.style.transform = "translate3d(0, 200%, 0)";
    this.mountNode.style.transition = "transform 1s ease";

    this.rootNode.appendChild(this.mountNode);
  },

  onStart() {
    _logToConsole(`page: ${this.id} 将被启动`);
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
    _logToConsole(`page ${this.id} 被暂停`);

    // this.mountNode.style.display = "none";
    this.mountNode.style.transform = "translate3d(0, -200%, 0)";
    this.mountNode.style.zIndex = -1;
  },

  onResume() {
    _logToConsole(`page ${this.id} 重新激活`);

    // this.mountNode.style.display = "block";
    this.mountNode.style.transform = "translate3d(0, 0, 0)";
    this.mountNode.style.zIndex = 10;
  },

  onStop() {
    _logToConsole(`page ${this.id} 停止`);

    this.mountNode.style.transform = "translate3d(0, -200%, 0)";
    this.mountNode.style.zIndex = -1;
    // this.mountNode.style.display = "none";
  },

  onDestroy() {
    _logToConsole(`page ${this.id} 将被销毁`);

    // 销毁自己
    this.rootNode.removeChild(this.mountNode);
  },

  onRestart() {
    _logToConsole(`page ${this.id} 重启`);

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
        {this.props.dataSrc.map((i, idx) => (
          <TabBar.Item
            title={i.title}
            active={idx === this.props.activeIdx}
            key={idx}
          />
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
        backgroundColor: props.active ? "#0984e3" : "#f0f0f0",
        marginBottom: "10px",
        borderRadius: "9999px",
        fontSize: "16px",
        lineHeight: "16px",
        cursor: "pointer"
      }}
      onClick={props.onClick}
    >
      <span>{props.active ? `- ${props.title}` : props.title}</span>
    </div>
  );
};

class MultiTabExample extends Component {
  constructor() {
    super();

    this.state = {
      activeIdx: -1
    };
  }

  _openPage(page, idx) {
    this.setState(
      {
        activeIdx: idx
      },
      () => {
        ll.open(page);
      }
    );
  }

  _refreshPage(page, idx) {
    this.setState(
      {
        activeIdx: idx
      },
      () => {
        ll.refresh(page);
      }
    );
  }

  render() {
    return (
      <div>
        {/* console */}
        <div
          id="consolep-scroll"
          style={{
            width: "300px",
            height: "600px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            boxShadow: "3px 3px 10px 0px rgba(0, 0, 0, .5)",
            position: "absolute",
            right: "20px",
            top: "20px",
            zIndex: 9999999,
            overflow: "auto",
            boxSizing: "border-box",
            paddingBottom: "20px"
          }}
        >
          <div
            style={{
              boxSizing: "border-box",
              padding: "20px"
            }}
          >
            <h1
              style={{
                margin: 0,
                padding: 0,
                fontSize: "16px",
                lineHeight: "16px",
                color: "#16a085",
                marginBottom: "10px"
              }}
            >
              > llpage console
            </h1>

            <h3
              style={{
                margin: 0,
                padding: 0,
                fontSize: "12px",
                lineHeight: "12px",
                color: "#9b59b6",
                marginBottom: "4px"
              }}
            >
              {`当前设置的保活数量: ${ll.size}`}
            </h3>

            <h3
              style={{
                margin: 0,
                padding: 0,
                fontSize: "12px",
                lineHeight: "12px",
                color: "#3498db"
              }}
            >
              {`实际当前链表长度: ${ll.pageList.size}`}
            </h3>
          </div>

          <div
            id="consolep"
            style={{
              padding: "0 20px",
              boxSizing: "border-box"
            }}
          />
        </div>

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
                  active={idx === this.state.activeIdx}
                  title={i.title}
                  onClick={() => {
                    // pass
                    this._openPage(pages[idx], idx);
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
          <TabBar dataSrc={mockData} activeIdx={this.state.activeIdx} />

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
    this._openPage(pages[0], 0);
    _logToConsole("<====== 3s 后刷新页面 1 ======>");

    setTimeout(() => {
      this._refreshPage(pages[0], 0);

      console.dir(ll);
    }, 3000);
  }
}

ReactDOM.render(<MultiTabExample />, document.getElementById("example"));
