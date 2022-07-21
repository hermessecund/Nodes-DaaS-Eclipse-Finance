const Web3 = require("web3");

export default (props)=> {
  const {
    addToWallet,
    walletAddress,
    activeNetwork,
    changeNetwork,
    CHAIN_ID,
    connectWallet,
    userNumberOfNodes,
    totalNumberOfNodes,
    userRewards,
  } = props;
  return (
    <>
      <header>
        <nav>
          <div id="logo">
            <img src="images/logo.jpeg" alt="" />
          </div>
          <div className="wallet_btns">
            <span onClick={() => addToWallet()} id="add-btn">
              Add to Wallet
            </span>
            <a href="#" id="buy-btn">
              Buy
            </a>
            <span
              onClick={() => {
                if (walletAddress && activeNetwork != CHAIN_ID) {
                  changeNetwork();
                } else if (!walletAddress) {
                  connectWallet();
                }
              }}
              id={
                walletAddress && activeNetwork != CHAIN_ID
                  ? "network-btn"
                  : "connect-btn"
              }
            >
              {walletAddress
                ? activeNetwork == CHAIN_ID
                  ? (
                      walletAddress.slice(0, 5) +
                      "..." +
                      walletAddress.slice(-4)
                    ).toUpperCase()
                  : "Wrong network"
                : "Connect wallet"}
            </span>
          </div>
        </nav>
      </header>
      <div className="row">
        <div className="container_row pl">
          <div id="owned" className="row-1">
            <div>
              <img src="images/mynodes.png" alt="" />
            </div>
            <div className="col-row">
              <p id="number-owned" className="number">
                {userNumberOfNodes}/50
              </p>
              <p id="color-a" className="text-row">
                My Nodes
              </p>
            </div>
          </div>
        </div>
        <div className="container_row pc">
          <div id="minted" className="row-1">
            <div>
              <img src="images/allnodes.png" alt="" />
            </div>
            <div className="col-row">
              <p id="number-minted" className="number">
                {totalNumberOfNodes || "0"}
              </p>
              <p id="color-b" className="text-row">
                All nodes
              </p>
            </div>
          </div>
        </div>
        <div className="container_row pr">
          <div id="rewards" className="row-1">
            <div>
              <img src="images/$ECLIPSE.png" alt="" />
            </div>
            <div className="col-row">
              <p id="number-rewards" className="number">
                {userRewards
                  ? Number.parseFloat(
                      Web3.utils.fromWei(userRewards.toString(), "ether")
                    ).toFixed(2)
                  : "0.00"}{" "}
                <span className="color-c">$ECL</span>
              </p>
              <p className="color-c" id="text-row">
                My Rewards
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
