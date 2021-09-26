'use strict';

const {Contract} = require('fabric-contract-api');

class RegnetRegistrarContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.regnet.registrar');
	}

	/* ****** All custom functions are defined below ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console

	async instantiate(ctx) {
		console.log('Regnet Registrar Smart Contract Instantiated');
	}

	/**
	 * Approving the User Request and setting balance of upgrad coins to 0
	 * @param ctx - The transaction context;
	 * @param name - The Name of the User
	 * @param aadharNumber - The Aadhar of the user
	 * @returns User
	 */
	async approveNewUser(ctx, name, aadharNumber){
		
		//Fetching Request Key
		const requestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.request',[name, aadharNumber]);

		//Fetching the User Key
		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name, aadharNumber]);

		//Getting the user request
		let requestBuffer = await ctx.stub.getState(requestKey).catch(err => console.log(err));

		if(requestBuffer.length === 0){
			throw new Error("Request doesn't exist");
		}

		let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));

		if(userBuffer.length !== 0){
			throw new Error("User already exists");
		}

		let newUserObject = JSON.parse(requestBuffer.toString());
		
		//Adding the upgrad coins value to show the user is approved
		newUserObject['upgradCoins'] = 0;

		//Updating the User object on the Blockchain
		let dataBuffer = Buffer.from(JSON.stringify(newUserObject));

		await ctx.stub.putState(userKey, dataBuffer);

		//Returning the User object to the Registrar.
		return newUserObject;

	}



	/**
	 * View User Details
	 * @param ctx - Transaction Context
	 * @param name - Name of the User to search for
	 * @param aadharNumber - Aadhar Number to search user for
	 * @returns UserDetails
	 */

	async viewUser(ctx, name, aadharNumber){

		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name, aadharNumber]);

		let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));

		if(userBuffer.length === 0){
			throw new Error("User doesn't exist");
		}

		let userObject = JSON.parse(userBuffer.toString());
		return userObject;
	}



	/**
	 * Method to view property on the Blockchain using the id
	 * @param ctx - Transaction Context
	 * @param propertyId - Id of property to be looked up
	 * @returns propertyObject - Selected property if it exists
	 */

	 async viewProperty(ctx, propertyId){

		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyId]);

		let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err => console.log(err));

		if(propertyBuffer.length === 0){
			throw new Error("Property doesn't exist");
		}

		let propertyObject = JSON.parse(propertyBuffer.toString());

		return propertyObject;

	 }



	/**
	 * Registrar approves Property request and add Property Asset to Blockchain Ledger
	 * @param ctx - Transaction Context
	 * @param propertyId - Id of the property to approve
	 * @returns Property Object
	 */

	async approvePropertyRegistration(ctx, propertyId){

		const requestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.request',[propertyId]);

		let requestBuffer = await ctx.stub.getState(requestKey).catch(err => console.log(err));

		if(requestBuffer.length === 0){
			throw new Error("Request doesn't exist");
		}

		let requestObject = JSON.parse(requestBuffer.toString());

		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyId]);

		let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err => console.log(err));

		if(propertyBuffer.length !== 0){
			throw new Error("Property already is Approved");
		}

		await ctx.stub.putState(propertyKey, requestBuffer);
		return requestObject;
	}

}
module.exports = RegnetRegistrarContract;

