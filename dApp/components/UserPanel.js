const Web3 = require("web3");
const ECLIPSE_CONTRACT_INFO = require("../contracts/eclipse.json");

export default (props) => {
  const {
    walletAddress,
    activeNetwork,
    CHAIN_ID,
    userBalance,
    approve,
    approveMessage,
    setNodeName,
    timeConverter,
    nodeName,
    userNodes,
    createNode,
    claim,
  } = props;

  return (
    <div id="panel">
      <div className="container_panel">
        <div className="title">Welcome to Eclipse Finance</div>
        <div className="text_content">
          From this dApp, you can create nodes (up to 50 per wallets), see your
          rewards, claim them. You can name your nodes and create them below.
          {walletAddress ? " " : "You need to connect your wallet first."}
        </div>
        <div id="container_row">
          <div className="row_btn">
            <div className="container_btn cl">
              <a
                href={`https://traderjoexyz.com/trade?outputCurrency=${ECLIPSE_CONTRACT_INFO.tokenAddress}`}
                className="padding_btn buy"
              >
                Buy $ECL
              </a>
            </div>
            <div className="container_btn">
              <a
                href="https://twitter.com/EclipseFinance"
                className="padding_btn twitter"
              >
                Twitter
              </a>
            </div>
          </div>
          <div className="row_btn">
            <div className="container_btn">
              <a
                href="https://discord.gg/eclipsefinance"
                className="padding_btn discord"
              >
                Discord
              </a>
            </div>
            <div className="container_btn cr">
              <a
                href={`https://dexscreener.com/avalanche/${ECLIPSE_CONTRACT_INFO.pairAddress}`}
                className="padding_btn chart"
              >
                Chart
              </a>
            </div>
          </div>
        </div>
        <div className="node_menu">
          <div className="container_node">
            <div className="title_node">
              You need at least 20 $ECL to create a node and earn lifetime
              rewards. <br />
              Currently estimated rewards at 2 $ECL per node per day.
            </div>
            <div className="row_menu">
              <div id="balance">
                <div id="balance_number">
                  {userBalance ? parseInt(userBalance).toFixed(2) : 0}
                </div>
                <div className="balance_content">$ECL Balance</div>
                <div className="line"></div>
              </div>
              <div id="connected_wallet">
                <div
                  id={activeNetwork == CHAIN_ID ? "balance_number" : "connected"}
                >
                  {walletAddress
                    ? activeNetwork == CHAIN_ID
                      ? (
                          walletAddress.slice(0, 5) +
                          "..." +
                          walletAddress.slice(-4)
                        ).toUpperCase()
                      : "Wrong network"
                    : "Not connected"}
                </div>
                <div className="connected_content">Wallet</div>
                <div className="line"></div>
              </div>
              <div id="approve">
                <div
                  className="approve_btn"
                  onClick={() => {
                    approve();
                  }}
                >
                  <a href="#" id="approve_btn">
                    {approveMessage}
                  </a>
                </div>
                <div className="approve_content">Approve $ECL</div>
              </div>
            </div>
            <div className="col_row_2">
              <div className="line_top white"></div>
              <div className="title_row_2">Create your node</div>
              <div className="row_2">
                <div className="left">
                  <input
                    id="node_name"
                    type="text"
                    onChange={(e) => setNodeName(e.target.value)}
                    value={nodeName}
                    placeholder="Node name"
                  />
                </div>
                <div className="right">
                  <span onClick={() => createNode()} id="mint_node">
                    Create node
                  </span>
                </div>
              </div>
              <div className="col_line">
                <div className="line_col white"></div>
                <div className="title_col_2">Your nodes</div>
              </div>
            </div>
            <div className="created_node">
              <div className="col_1">
                <div className="row_3">
                  <div className="upper_part">Name</div>
                  <div className="upper_part">Creation date</div>
                  <div className="upper_part">Rewards</div>
                  <div className="upper_part">Claim rewards</div>
                </div>
                {userNodes.map((node, i) => (
                  <div className="row_4" key={i}>
                    <div className="lower_part" id="user_node">
                      {node.name}
                    </div>
                    <div className="lower_part" id="time">
                      {timeConverter(node.createDate)}
                    </div>
                    <div className="lower_part" id="rewards">
                      {Number.parseFloat(
                        Web3.utils.fromWei(node.rewards, "ether")
                      ).toFixed(3)}{" "}
                      $ECL
                    </div>
                    <div className="lower_part">
                      <span onClick={() => claim(i)} id="claim_btn">
                        Claim
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {userNodes.map((node, i) => (
                <div key={i} class="col_2">
                  <div class="col_3">
                    <div class="upper_part">Name</div>
                    <div class="lower_part" id="user-node">
                      {node.name}
                    </div>
                    <div class="line_2"></div>
                  </div>
                  <div class="col_3">
                    <div class="upper_part">Creation date</div>
                    <div class="lower_part" id="time">
                      {timeConverter(node.createDate)}
                    </div>
                    <div class="line_2"></div>
                  </div>
                  <div class="col_3">
                    <div class="upper_part">Rewards</div>
                    <div class="lower_part" id="rewards">
                      {Number.parseFloat(
                        Web3.utils.fromWei(node.rewards, "ether")
                      ).toFixed(3)}{" "}
                      $ECL
                    </div>
                    <div class="line_2"></div>
                  </div>
                  <div class="col_3">
                    <div class="upper_part">Claim rewards</div>
                    <div class="lower_part">
                      <a href="#" id="claim_btn">
                        Claim
                      </a>
                    </div>
                  </div>
                  <div class="line white"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
