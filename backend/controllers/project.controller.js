
require('dotenv').config({ path: '.env' });
const HDWalletProvider = require('@truffle/hdwallet-provider');
const schedule = require('node-schedule');
const axios = require('axios');
const TokenAbi = require("../../build/contracts/IERC20.json");
const Web3 = require("web3")
const mnemonic = "1a1fd694570f84bcb670657d19b25e97bf441b9a638a89b69e11e125b1bbb48e";


var contract;
var projectContract;
var stableToken;

///*
//*   Initialize project contract
//*   Get Contributions of the Project
//*/

const TruffleContract = require('truffle-contract');
const Artefact = require("../../build/contracts/GoAfrica.json");
const projArt = require("../../build/contracts/Project.json")

const provider = new  HDWalletProvider(mnemonic, `https://eth-goerli.g.alchemy.com/v2/yLafHt5uip0F_4CLSvkI6grjY1VvLIDu`)

const web3 = new Web3(provider);

const getContributions = async () => {
    await initProjectContract(address);
    const data = await projectContract.getContributions().call();
    console.log("contributions", data);
    if (data) {
        return data;
    } else {
        throw "Unable to get contributions";
    }
}

/* Init Contract and set default Variable *Contract* */
async function init() {
    try {
        contract = new web3.eth.Contract(Artefact.abi, "0x03E3b9a69FA69bF32F51D4Eb912A80482e1ad003",  {
            from: '0xb954de63aAc9dc7D03f82046c4505EA27c16b5e1', // default from address
            gasPrice: '550000000' // default gas price in wei, 20 gwei in this case
        })
    } catch (error) {
        throw "Unable to get contract instance";
        console.log("error")
    }
}

/* Init Project Contract and set default Variable *projectContract* */
async function initProjectContract(address) {

    try {
        projectContract = new web3.eth.Contract(projArt.abi, address,  {
            from: '0xb954de63aAc9dc7D03f82046c4505EA27c16b5e1', // default from address
            gasPrice: '550000000' // default gas price in wei, 20 gwei in this case
        })
        console.log("project start at ", projectContract._address)
    } catch (error) {
        throw "Unable to get contract instance; check your address !";
    }  
}

/* Get Stable token (USDT) */
async function getStableToken() {
    try {
        stableToken = new web3.eth.Contract(TokenAbi.abi, "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1")
        //console.log(stableToken)
    } catch (error) {
        throw "Unable to get stable token";
    }
}

/* check transactio hash */
exports.checkTransactionHash = async (req, res) => {
    const projectAddress = "0x03E3b9a69FA69bF32F51D4Eb912A80482e1ad003";
    const userId = 1;
    const txnHash = req.params.hash;
    try {
        await initProjectContract(projectAddress);
        const isInvestor = await projectContract.methods.checkIfInvestor(userId).call();
        return "SUCCESS";
    } catch (error) {
        return "ERROR";
    }
}


/* Get all available project addresses */
exports.getAllProjects = async (req, res) => {
    try {
        await init(); /* First init contract instance */
        let data = await contract.methods.returnProjectsAddresses().call();
        return res.status(200).json({ msg: "Success", success: true, data: data });
    } catch (error) {
        return res.status(500).json({ msg: "unable to find project list !", success: false, data: error });
    }
}


/* Create a project and return address */
exports.createproject = async (req, res) => {

    const body = req.body;

    /* Check reference and amount */
    if (isNaN(Number(body.ref)) || isNaN(Number(body.amount))) {
        return res.status(400).json({ msg: "Only Number need for amount or ref", success: false, data: null });
    }

    try {
        await init();
        await getStableToken();
        console.log("Enter");
        const projectGoal = Number(body.amount) * 1e6; /* convert amount of the project */
        const result = await contract.methods.createProject(
            "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
            Number(body.ref),
            projectGoal,
            body.title).send({gasLimit: 5000000})
             .on('transactionHash', function(hash){
                console.log("Hash", hash)
             })
             .on('receipt', function(receipt){
                console.log("receipt", receipt)
                return res.status(200).json({ msg: "Success", success: true, data: result });
             });
        
    } catch (error) {console.log("Error",error);
        return res.status(500).json({ msg: "unable to create project", success: false, data: error.error });
    }
};


/* get all project details */
exports.getProjectById = async (req, res) => {
    let id = req.params.id;

    /* Check if the id is a real number */
    if (isNaN(Number(id))) {
        return res.status(400).json({ msg: "Only Number need here", success: false, data: null });
    }

    try {
        await init();
        const project = await contract.methods.getProjectByRef(Number(id)).call();
        if (project) {
            // Convert
            const result = {
                address: project["proj"],
                projectRef: project["ref"],
                goalAmount: project["goalAmount"],
                currentAmount: project["currentAmount"],
                title: project["title"]
            }

            return res.status(200).json({ msg: "Success", success: true, data: result });
        } else {
            return res.status(500).json({ msg: "unable to create project", success: false, data: error.error });
        }
    } catch (error) {
        console.log("Error", error);
        return res.status(500);
    }
};


// project details converter
function convertAllData(data) {
    return {
        creatorAddress: data["creator"],
        projectRef: data["projectRef"],
        projectTitle: data["projectTitle"],
        currentState: data["currentState"],
        projectGoalAmount: data["projectGoalAmount"],
        currentAmount: data["currentAmount"],
        investments: data["investmentss"],
        cashins: data["cashinss"],
        cashouts: data["cashoutss"]
    };
}

/*
*   Get all Project Details
*   Pass address of the project
*   Return details, investments, cashins, cashout...
*/
exports.getAllProjectDetails = async (req, res) => {
    try {
        await initProjectContract(req.params.address);
        const project = await projectContract.methods.getDetails().call();
        return res.status(200).json({ msg: "Success", success: true, data: convertAllData(project) });
    } catch (error) {
        return res.status(500).json({ msg: "unable to get project", success: false, data: error.error });
    }
}


/* Convert contributions data */
function convertContribsData(data) {
    return {
        investments: data["invests"],
        currentBalance: data["currentAmount"],
        goalAmount: data["goal"]
    }
}
/*
*   Get Project Contributions
*   Pass address of the project
*   Return investments, golAmount and current amount
*/
exports.getProjectContributions = async (req, res) => {
    try {
        await initProjectContract(req.params.address);
        const contribs = await projectContract.methods.getContributions().call();
        console.log("Contribs", contribs);
        return res.status(200).json({ msg: "Success", success: true, data: convertContribsData(contribs) });
    } catch (error) {
        return res.status(500).json({ msg: "unable to get data", success: false, data: error.error });
    }
}

/*
*   Get Project Cash In
*/
exports.getProjectCashIns = async (req, res) => {
    try {
        await initProjectContract(req.params.address);
        const cashins = await projectContract.methods.getCashIns().call();
        return res.status(200).json({ msg: "Success", success: true, data: cashins });
    } catch (error) {
        return res.status(500).json({ msg: "unable to get data", success: false, data: error.error });
    }
}


/*
*   Get Project Cash Out
*/
exports.getProjectCashOuts = async (req, res) => {
    try {
        await initProjectContract(req.params.address);
        const cashouts = await projectContract.methods.getCashOuts().call();
        return res.status(200).json({ msg: "Success", success: true, data: cashouts });
    } catch (error) {
        return res.status(500).json({ msg: "unable to get data", success: false, data: error.error });
    }
}


/*
*   Make a Cash In
*/
exports.addCashIn = async (req, res) => {
    try {
        await initProjectContract(req.params.address);
        const amount = req.body.amount * 1e6;
        const today = new Date().toISOString();
        const cashin = await projectContract.methods.cashIn(today, req.body.address, req.body.reason, amount).send({gasLimit: 5000000})
        return res.status(200).json({ msg: "Success", success: true, data: cashin });
    } catch (error) {
        return res.status(500).json({ msg: "unable to get data", success: false, data: error.error });
    }
}


/*
*   Make a Cash Out
*/
exports.sendCashOut = async (req, res) => {
    try {
        await initProjectContract(req.params.address);
        const amount = req.body.amount * 1e6;
        const today = new Date().toISOString();
        const cashout = await projectContract.methods.cashOut(today, req.body.address, req.body.reason, amount).send({gasLimit: 5000000})
        return res.status(200).json({ msg: "Success", success: true, data: cashout });
    } catch (error) {
        return res.status(500).json({ msg: "unable to get data", success: false, data: error.error });
    }
}


/*
*   Set Project State
*/
exports.setProjectState = async (req, res) => {
    let pk = req.headers.authorization.toString();
    if (pk.includes("pk;")) {
        pk = ak.replace("pk;", "");

        if (pk === primaryKey) {
            await initProjectContract(req.params.address);
            try {
                const cashouts = await projectContract.methods.getCashOuts().call();
                return res.status(200).json({ msg: "Success", success: true, data: cashouts });
            } catch (error) {
                return res.status(500).json({ msg: "unable to get project", success: false, data: error.error });
            }
        } else {
            return res.status(400).json({ msg: "Bad token sent !", success: false, data: null });
        }
    } else {
        return res.status(401).json({ msg: "Token needed !", success: false, data: null });
    }
}


// Invest to a project
exports.invest = async (req, res) => {
    let body = req.body;
    
    var amount = parseInt(body.amount) * 1e6;
    
    try {
        await initProjectContract(req.params.addr);
        await getStableToken(); 
        var approve = await stableToken.methods.approve(projectContract._address, amount)
        console.log("Approve", approve);

        //let trx = await approve.getTransactionHash();

        //console.log("Approbation", trx);
        res.send("WEll");
        // try {
        //     const result = await projectContract.invest(amount, body.email)
        //         .send({
        //             feeLimit: 1_000_000_000,
        //             callValue: amount,
        //             shouldPollResponse: true
        //         });
        //     console.log("result", result);
        //     return res.status(200).json({ success: true, data: result });
        // } catch (error) {
        //     console.log("error invest", error);
        //     return res.status(500).json({ msg: "unable to invest", success: false, data: error.error });
        // }
    } catch (error) {
        console.log("error approval", error);
        return res.status(500).json({ msg: "Transaction could not be approved !", success: false, data: error.error });
    }


};


/*
*   Project scheduler for pay all investors
*   get all investments, use contract "sendIncome" method
*   on each investor's address and also save in a table all
*   failed transaction to repeat the process again
*/
exports.setScheduler = async (req, res) => {
    schedule.scheduleJob(req.body.dateToLaunch, async () => {
        // Define array of real amount investors may have and failed sending transactions
        var logicInvestment = [];
        var failedSending = [];

        try {
            const contribs = await getContributions(req.params.address);
            const goalAmount = contribs.goal;
            const currentAmount = contribs.currentAmount;

            for (const invest of contribs.invests) {
                const rate = invest.amount / goalAmount;
                logicInvestment.push({
                    address: invest.investorAddress,
                    amount: rate * currentAmount,
                    mail: invest.email
                });
            }

            // Now sendIncomes
            let first = true;
            do {
                // Firstly send income with normal array of contributors
                if (first) {
                    for (const investor of logicInvestment) {
                        try {
                            let invest = await projectContract.methods.sendIncome(investor.address, investor.amount);

                            
                            // console.log('amount', investor.amount);
                            // const sending = await projectContract.sendIncome(investor.address, investor.amount)
                            //     .send({
                            //         feeLimit: 1_000_000_000,
                            //         callValue: 0,
                            //         shouldPollResponse: true
                            //     });
                            // console.log(`Sending result for ${investor.address}`, sending)

                            // Send email to successful notified
                            axios.get(`https://tron-hackathon-spring-backend.go-africa.io/project/income/${req.params.id}/${investor.mail}`)
                                .then(
                                    res => {
                                        if (~~(res.status / 200) <= 4) {
                                            console.log("Everything work successfully", res.status);
                                        } else {
                                            console.log("Nothing works");
                                        }
                                    }
                                ).catch(
                                    err => {
                                        console.log('Here the error', err);
                                    }
                                )
                        } catch (error) {
                            console.log("The error", error);
                            failedSending.push(investor);
                        }
                    }
                    first = false;
                } else {
                    // If some send has failed send income with failed array of contributors
                    for (const investor of failedSending) {
                        
                        let invest = await projectContract.methods.sendIncome(investor.address, investor.amount);
                        
                        axios.get(`https://tron-hackathon-spring-backend.go-africa.io/project/income/${req.params.id}/${investor.mail}`)
                            .then(
                                res => {
                                    if (~~(res.status / 200) <= 4) {
                                        console.log("Everything work successfully", res.status);
                                    } else {
                                        console.log("Nothing works");
                                    }
                                }
                            ).catch(
                                err => {
                                    console.log('Here the error', err);
                                }
                            )
                        // try {
                        //     await projectContract.sendIncome(investor.address, investor.amount)
                        //         .send({
                        //             feeLimit: 1_000_000_000,
                        //             callValue: 0,
                        //             shouldPollResponse: true
                        //         });
                        // } catch (error) {
                        //     console.log("The investor", investor);
                        //     console.log("The error", error);
                        //     failedSending.push(investor)
                        // }
                    }
                }
            } while (failedSending.length > 0);

            console.log("Everything work successfully");
        } catch (error) {
            throw error;
        }
    });

    res.status(200).json({ message: 'set successfully !' });

};
