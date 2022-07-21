import React, { useState, useEffect } from "react";
import "./App.css";

import Header from "./components/Header";
import UserPanel from "./components/UserPanel";
const Web3 = require("web3");
const ECLIPSE_CONTRACT_INFO = require("./contracts/eclipse.json");
const CHAIN_ID = 43114;

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [activeNetwork, setActiveNetwork] = useState(null);
  const [eclipseContract, setEclipseContract] = useState(null);
  const [isEvents, setIsEvents] = useState(false);

  const [userBalance, setUserBalance] = useState(null);
  const [userNumberOfNodes, setUserNumberOfNodes] = useState(0);
  const [totalNumberOfNodes, setTotalNumberOfNodes] = useState(null);
  const [userRewards, setUserRewards] = useState(null);
  const [userNodes, setUserNodes] = useState([]);

  const [approveMessage, setApproveMessage] = useState("Approve");
  const [nodeName, setNodeName] = useState("");

  const connectWallet = async () => {
    const ethereum = window.ethereum;
    if (ethereum) {
      const web3 = new Web3(ethereum);
      setEclipseContract(
        new web3.eth.Contract(
          ECLIPSE_CONTRACT_INFO.abi,
          ECLIPSE_CONTRACT_INFO.tokenAddress
        )
      );
      if (!isEvents) {
        setEthEvents(ethereum, web3);
      }
      setIsEvents(true);

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
    } else {
      console.log("Non-Ethereum browser detected. Please install Metamask!");
    }
  };

  const addToWallet = async () => {
    const tokenAddress = ECLIPSE_CONTRACT_INFO.address;
    const tokenSymbol = "ECL";
    const tokenDecimals = 18;
    const tokenImage = "images/solar.jpeg";

    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const changeNetwork = async () => {
    const ethereum = window.ethereum;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xA86A" }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                CHAIN_ID: "0xA86A",
                chainName: "Avalanche Mainnet C-Chain",
                nativeCurrency: {
                  name: "Avalanche",
                  symbol: "AVAX",
                  decimals: 18,
                },
                rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
                blockExplorerUrls: ["https://cchain.explorer.avax.network/"],
              },
            ],
          });
        } catch (addError) {}
      }
    }
  };

  const setEthEvents = (eth, web3) => {
    eth.on("connect", async (accounts) => {
      setWalletAddress(accounts[0]);
      if (accounts[0]) {
        getUserData();
      }
    });
    eth.on("accountsChanged", async (accounts) => {
      setWalletAddress(accounts[0]);
      if (accounts[0]) {
        getUserData();
      }
    });

    eth.on("chainChanged", async (CHAIN_ID) => {
      setActiveNetwork(CHAIN_ID);
      const accounts = await web3.eth.getAccounts();
      if (accounts[0]) {
        getUserData();
      }
    });

    eth.on("disconnect", () => {
      setWalletAddress(null);
      setUserBalance(0);
      setActiveNetwork(null);
      getUserData();
    });
  };

  const claim = async (i) => {
    if (window.confirm("Are you sure you want to claim your node?")) {
      await eclipseContract.methods.claim(i).send({ from: walletAddress });
      getUserData();
    }
  };

  const getUserData = async () => {
    if (walletAddress && activeNetwork == CHAIN_ID) {
      setUserBalance(
        Web3.utils.fromWei(
          await eclipseContract.methods.balanceOf(walletAddress).call(),
          "ether"
        )
      );

      setUserNumberOfNodes(
        await eclipseContract.methods.getNumberOfNode(walletAddress).call()
      );

      setTotalNumberOfNodes(await eclipseContract.methods.totalNodes().call());

      setUserRewards(
        await eclipseContract.methods
          .getTotalPendingRewards(walletAddress)
          .call()
      );

      let tempPendingRewardsEach = await eclipseContract.methods
        .getPendingRewardsEach(walletAddress)
        .call();

      tempPendingRewardsEach = tempPendingRewardsEach.substring(1);
      tempPendingRewardsEach = tempPendingRewardsEach.split("#");

      let tempUserNodes = [];
      for (let i = 0; i < userNumberOfNodes; i++) {
        let tempUserNode = await eclipseContract.methods
          .nodes(walletAddress, i)
          .call();
        tempUserNode.rewards = tempPendingRewardsEach[i];
        tempUserNodes.push(tempUserNode);
      }

      setUserNodes(tempUserNodes);
    } else {
      setUserBalance(0);
      setUserNumberOfNodes(0);
      setTotalNumberOfNodes(null);
      setUserNodes([]);
      setUserRewards(null);
    }
  };

  const approve = async () => {
    if (walletAddress && activeNetwork == CHAIN_ID) {
      setApproveMessage("Approving...");

      try {
        await eclipseContract.methods
          .approve(
            ECLIPSE_CONTRACT_INFO.tokenAddress,
            Web3.utils.toWei("2000000000", "ether")
          )
          .send({ from: walletAddress });
        setApproveMessage("Approve");
      } catch (e) {
        setApproveMessage("Approve");
      }
    }
  };

  const createNode = async () => {
    if (nodeName.length > 0) {
      let createNodeReq = await eclipseContract.methods
        .mint(nodeName)
        .send({ from: walletAddress });
      getUserData();
      console.log(createNodeReq);
    }
  };
  const timeConverter = (UNIX_timestamp) => {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hours = a.getHours();
    var minutes = a.getMinutes();

    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;

    var time = month + " " + date + ", " + year + " " + strTime;
    return time;
  };
  useEffect(() => {
    const ethereum = window.ethereum;

    async function connectAtLoad() {
      const web3 = new Web3(ethereum);
      const CHAIN_ID = await web3.eth.getChainId();
      setActiveNetwork(CHAIN_ID);
      setEclipseContract(
        new web3.eth.Contract(
          ECLIPSE_CONTRACT_INFO.abi,
          ECLIPSE_CONTRACT_INFO.tokenAddress
        )
      );

      const accounts = await web3.eth.getAccounts();
      setWalletAddress(accounts[0]);
      if (accounts[0]) {
        getUserData();
        setEthEvents(ethereum, web3);
        setIsEvents(true);
      } else {
        connectWallet();
      }
    }
    if (ethereum) {
      connectAtLoad();
    }
  }, []);

  useEffect(() => {
    if (activeNetwork != CHAIN_ID) {
      changeNetwork();
    }
  }, [activeNetwork]);

  useEffect(() => {
    getUserData();
  }, [walletAddress]);

  return (
    <>
      <Header
        walletAddress={walletAddress}
        addToWallet={addToWallet}
        activeNetwork={activeNetwork}
        changeNetwork={changeNetwork}
        CHAIN_ID={CHAIN_ID}
        connectWallet={connectWallet}
        userNumberOfNodes={userNumberOfNodes}
        totalNumberOfNodes={totalNumberOfNodes}
        userRewards={userRewards}
      />

      <UserPanel
        walletAddress={walletAddress}
        timeConverter={timeConverter}
        activeNetwork={activeNetwork}
        userBalance={userBalance}
        approve={approve}
        approveMessage={approveMessage}
        setNodeName={setNodeName}
        nodeName={nodeName}
        userNodes={userNodes}
        createNode={createNode}
        claim={claim}
        CHAIN_ID={CHAIN_ID}
      />
    </>
  );
}

export default App;
