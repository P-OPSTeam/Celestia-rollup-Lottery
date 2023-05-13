// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
  * @title Ethereum-Lottery
  * @author Nagaganesh Jaladanki
  * @dev Simple lottery smart contract to run on the Ethereum
  * chain. Designed to work well with a web3 front-end.
  * Source of randomness comes from Ethereum block hashes.
  * MIT License.
  */

contract Lottery {

    event LotteryTicketPurchased(address indexed _purchaser, uint256 _ticketID);
    event LotteryAmountPaid(address indexed _winner, uint256 _ticketID, uint256 _amount);

    // Note: prone to change
    uint64 public ticketPrice = 5000000000000000000;
    uint64 public ticketMax = 25;

    // Initialize mapping
    address payable[26] public ticketMapping;
    uint256 public ticketsBought = 0;

    // Prevent potential locked funds by checking greater than
    modifier allTicketsSold() {
      require(ticketsBought >= ticketMax);
      _;
    }

    /**
      * @dev Purchase ticket and send reward if necessary
      * @param _ticket Ticket number to purchase
      * @return bool Validity of transaction
      */
    function buyTicket(uint16 _ticket) payable public returns (bool) {
      require(msg.value == ticketPrice, "Invalid ticket price");
      require(_ticket > 0 && _ticket < ticketMax + 1, "Invalid ticket number");
      require(ticketMapping[_ticket] == address(0), "Ticket already sold");
      require(ticketsBought < ticketMax, "All tickets already sold");

      // Avoid reentrancy attacks
      address payable purchaser = payable(msg.sender);
      ticketsBought += 1;
      ticketMapping[_ticket] = purchaser;
      emit LotteryTicketPurchased(purchaser, _ticket);

      /** Placing the "burden" of sendReward() on the last ticket
        * buyer is okay, because the refund from destroying the
        * arrays decreases net gas cost
        */
      if (ticketsBought>=ticketMax) {
        sendReward();
      }
      return true;
    }

    /**
      * @dev Send lottery winner their reward
      * @return address of winner
      */
    function sendReward() public allTicketsSold returns (address payable ) {
      uint256 winningNumber = lotteryPicker();
      address payable winner = ticketMapping[winningNumber];
      uint256 totalAmount = ticketMax * ticketPrice;

      // Prevent locked funds by sending to bad address
      require(winner != address(0));

      // Prevent reentrancy
      reset();
      winner.transfer(totalAmount);
      emit LotteryAmountPaid(winner, winningNumber, totalAmount);
      return winner;
    }

    /* @return a random number based off of current block information */
    function lotteryPicker() public view allTicketsSold returns (uint256) {
      bytes memory entropy = abi.encodePacked(block.timestamp, block.number);
      bytes32 hash = sha256(entropy);
      return uint256(hash) % ticketMax;
    }

    /* @dev Reset lottery mapping once a round is finished */
    function reset() private allTicketsSold returns (bool) {
      ticketsBought = 0;
      for(uint x = 0; x < ticketMax+1; x++) {
        delete ticketMapping[x];
      }
      return true;
    }

    /** @dev Returns ticket map array for front-end access.
      * Using a getter method is ineffective since it allows
      * only element-level access
      */
    function getTicketsPurchased() public view returns(address payable[26] memory) {
      return ticketMapping;
    }
}
