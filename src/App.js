

import React, { useState, useEffect } from "react";
import Web3 from "web3";
//import { abi } from "./contractAbi";
import lotteryabi from "./Lottery.json";
import { contract_address } from "./config.js";

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [networkRPCURL, setNetworkRPCURL] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [ticketMax, setTicketMax] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(null);
  const [nbticketbought, setnbticketBought] = useState(null);
  const [ticketPurchased, setTicketPurchased] = useState([]);

  const init = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        setWeb3(web3);

        const networkId = await web3.eth.net.getId();
        setNetworkId(networkId);

        const provider = new Web3.providers.HttpProvider(
          web3.currentProvider.host
        );
        const rpcUrl = provider.host;
        console.log(rpcUrl)
        const networkRPCURL = rpcUrl;
        setNetworkRPCURL(networkRPCURL)

        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        const contract = new web3.eth.Contract(
          lotteryabi.abi,
          contract_address
        );
        setContract(contract);
        const blockNumber = await web3.eth.getBlockNumber();
        setBlockNumber(blockNumber);
        const ticketMax = await contract.methods.ticketMax().call();
        setTicketMax(ticketMax);
        const ticketPrice = await contract.methods.ticketPrice().call();
        setTicketPrice(web3.utils.fromWei(ticketPrice.toString(), 'ether'));
        const nbticketBought = await contract.methods.ticketsBought().call();
        setnbticketBought(nbticketBought);
        const ticketPurchased = await contract.methods.getTicketsPurchased().call();
        setTicketPurchased(ticketPurchased);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  };

  const purchaseTicket = async (number, ticketprice) => {
    try {
      console.log("Buying ticket #" + number + " at " + ticketPrice)
      const result = await contract.methods.buyTicket(number).send(
        {
          to: contract_address,
          from: accounts[0], 
          value: web3.utils.toWei(ticketprice, 'ether'),
          gas: 70000});
      console.log("result:" + result);
      setTicketPurchased(prevState => {
        const newState = [...prevState];
        newState[number] = accounts[0];
        return newState;
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const isTicketPurchased = (number) => {
    return ticketPurchased[number] != "0x0000000000000000000000000000000000000000";
  };
  
  const getButtonColor = (number) => {
    return isTicketPurchased(number) ? "red" : "green";
  };
  
  const table = [];
  for (let i = 0; i < 5; i++) {
    const children = [];
    for (let j = 0; j < 5; j++) {
      const number = i * 5 + j + 1;
      children.push(
        <td key={number}>
          { ticketPurchased[number] == "0x0000000000000000000000000000000000000000" ? (
          <button          
            onClick={() => purchaseTicket(number, ticketPrice)}
            disabled={!web3}
            style={{ backgroundColor: "green" }}
          >
            {number}
          </button>) : (
          <button          
            disabled={!web3}
            style={{ backgroundColor: "red" }}
          >
            {number}
          </button>
          )}
        </td>
      );
    }
    table.push(<tr key={i}>{children}</tr>);
  }

  const top = [];


  return (
    <div>
      <h2>MetaMask Status</h2>
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">
      <div class="container">
        <a class="navbar-brand js-scroll-trigger" href="#page-top">Etherball 🎟️</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarResponsive">
          <ul class="navbar-nav ml-auto">
            <li class="nav-item">
              <a class="nav-link js-scroll-trigger" href="#about">Buy A Ticket</a>
            </li>
            <li class="nav-item">
              <a class="nav-link js-scroll-trigger" href="#services">FAQ</a>
            </li>
            <li class="nav-item">
              <a class="nav-link js-scroll-trigger" href="#contact">Contact</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <header class="bg-primary text-white">
      <div class="container text-center">
        <h1>Play Etherball!</h1>
        <p class="lead">The current jackpot is 125 tEVMOS</p>
        {web3 ? (
      <div style={{ alignItems: 'center' }}>
        <p style={{ marginRight: '10px' }}>Connected to MetaMask with account: {accounts[0]}</p>
        <p>Latest Block Number: {blockNumber} | Network RPC URL : {networkRPCURL} | Network ID : {networkId}</p>
      </div>
    ) : (
        <p>Please connect to MetaMask</p>
      )}
            </div>
    </header>
      <h2 style={{ textAlign: 'center' }}>Smart Contract info</h2>
      {contract && (
  <>
    <p style={{ textAlign: 'center' }}>ticketMax: {ticketMax} | ticketPrice: {ticketPrice} | purchased: {nbticketbought}</p>
    <h2 style={{ textAlign: 'center' }}>Tickets :</h2>
    <table style={{ margin: 'auto' }}>
      <tbody>{table}</tbody>
    </table>
  </>
)}
    <section id="services" class="bg-light">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <h1>FAQ</h1>
            <h4>What is Etherball?</h4>
            <p class="lead">Etherball is a lottery built on top of the Etherum blockchain. Because of its decentralized nature, Etherball is completely controlled by the blockchain, so payments and ticket-buying is secured with the power of millions of computers around the world.</p>
            <h4>Why should I trust it?</h4>
            <p class="lead">You're free (and encouraged) to check out the source code at (etherscan link here). If you have any questions or concerns feel free to contact me using the links at the bottom of the page.</p>
            <h4>How can I use Etherball?</h4>
            <p class="lead">The easiest way to use Etherball is to download the Metamask wallet <a href="https://metamask.io">here</a>, send your Metamask wallet some ether using an exchange of sorts, and choosing a ticket to buy at the top of the page.</p>
            <h4>My transaction isn't going through. Why?</h4>
            <p class="lead">Try raising your gas limit for the transaction. Don't worry if it seems high; most of the times, the gas limit isn't even reached. Also, it's possible that someone else just bought the ticket that you clicked on and the website or blockchain didn't update yet. Try choosing a different ticket.</p>
            <h4>Why so few tickets?</h4>
            <p class="lead">Fewer tickets equals to faster games, which means less time waiting to see if you've won! The game resets automatically too, so you can play more games quicker.</p>
            <h4>What's your share?</h4>
            <p class="lead">Nothing! All of the ether raised by tickets goes to the winner. </p>
          </div>
        </div>
      </div>
    </section>
    <section id="contact">
    <footer class="py-5 bg-dark">
      <div class="container">
        <p class="m-0 text-center text-white">Made with ❤️ by <a href="https://pops.one">P-OPS</a>, inspired from <a href="https://github.com/njaladan/">Nagaganesh Jaladanki, </a></p>
      </div>
    </footer>
    </section>
    </div>
  );
}

export default App;