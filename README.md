# Getting with a Celestia Lottery rollup

Learn celestia (https://docs.celestia.org/concepts/how-celestia-works/introduction/) and its rollup (https://blog.celestia.org/sovereign-rollup-chains/)

## introduction

We are going to demo a dAPP (Lottery) deployed on a local ethermintd integrated with rollkit (https://rollkit.dev/docs/intro/). Blocks will be submitted to the Celesia DA layer via a local light node connected to the blockspace race.

## Requirements

- Foundry
- Celestia fork ethermind https://github.com/celestiaorg/ethermint.git
- rollkit https://rollkit.dev/docs/intro/
- nodejs v14.x, npm, reactjs
- metamask

## Build your light node

There are many guide out there and a good place to start building your light node is to follow the blockspace race incentivized testnet (ITN) tasks https://docs.celestia.org/nodes/itn-deploy-light/

> Do not forget to fund the account used by the light node

## Run your local Ethermintd/rollkit

### install golang v1.19.1

```
ver="1.19.1" 
cd $HOME 
wget "https://golang.org/dl/go$ver.linux-amd64.tar.gz" 
sudo rm -rf /usr/local/go 
sudo tar -C /usr/local -xzf "go$ver.linux-amd64.tar.gz" 
rm "go$ver.linux-amd64.tar.gz"
echo "export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin" >> $HOME/.profile
source $HOME/.bashrc
```

### Install Ethermintd/rollkit

```
git clone https://github.com/celestiaorg/ethermint.git
cd ethermint
make install
```

### Run it !

```
# init your local blockchain
bash init.sh

# generate
RPC=https://rpc-blockspacerace.pops.one
NAMESPACE_ID=$(openssl rand -hex 8)
DA_BLOCK_HEIGHT=$(curl $RPC/block | jq -r '.result.block.header.height')

# start local ethermint
ethermintd start --rollkit.aggregator true --rollkit.da_layer celestia --rollkit.da_config='{"base_url":"http://localhost:26659","timeout":60000000000,"gas_limit":6000000,"fee":6000}' --rollkit.namespace_id $NAMESPACE_ID --rollkit.da_start_height $DA_BLOCK_HEIGHT 
```

> Do not forget to fund the account used by the light node

You will the below error message if you haven't

```
9:26AM ERR DA layer submission failed error="rpc error: code = NotFound desc = account celestia14x0uurpx4gqcelp7tc28lp43sw5u9mr5tkfted not found" attempt=1 module=BlockManager
```

## Deploy your lottery contract

### Install foundry

```
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup 
```

### Extract the private key

```
PRIVATE_KEY=$(ethermintd keys unsafe-export-eth-key mykey --keyring-backend test)
```

The key will be used to deploy the contract

### Deploy the contract

```
cd $HOME
git clone https://github.com/P-OPSTeam/Celestia-rollup-Lottery.git
cd Celestia-rollup-Lottery
forge install foundry-rs/forge-std
# ignore the error with lib The following paths are ignored by one of your .gitignore files: lib
forge script script/Lottery.s.sol:ContractScript --rpc-url http://localhost:8545 --private-key $PRIVATE_KEY --broadcast
```

### Copy the contrat address

```
CONTRACT_ADDRESS=<contract_address from previous output>
```

### Test the contract

```
cast call $CONTRACT_ADDRESS "ticketMax()" --rpc-url http://localhost:8545
0x0000000000000000000000000000000000000000000000000000000000000019
```

> 0x19 is 25 in decimal

## Build the frontend 

### install the dependencies of project

```
# install nodejs 14.x
curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
sudo apt update
sudo apt -y install nodejs

# check node version
node  -v

# install project dependencies
npm install
```

### replace the contract address with yours

```
sed -i -e "s/0x7950626960596b0fbdd66381a5e88c6b5b7a0849/$CONTRACT_ADDRESS/g" src/config.js
```

### Update contract manifest

if you updated and build a different contract you will need to copy the new contract manifest

```
cp out/Lottery.s.sol/Lottery.sol src/
```

else you can skip this part

### run the frontend

```
npm run start
```

### Metamask network configuration

you will need to add a custom network pointing to your own ethermintd/rollit RPC endpoint
- Network Name : `My Ethermintd`
- New RPC URL : `http://<yourip>:8545`
- Chain ID : `9000`
- Currency symbol : `TEVMOS`

You can now import the $PRIVATE_KEY into metamask.

For testing, create another account and transfer EVMOS to that new account !!

Enjoy !!

# Credits
Thanks to <a href="https://github.com/njaladan/"> Nagaganesh Jaladanki </a>.