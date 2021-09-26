'use strict';

const {Contract} = require('fabric-contract-api');

class RegnetUserContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.regnet.user');
	}

	/* ****** All custom functions are defined below ***** */
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console

	async instantiate(ctx) {
		console.log('Regnet User Smart Contract Instantiated');
	}

	/**
	 * A user registered on the network initiates a transaction to request the registrar to store their details/credentials on the ledger.
	 * @param ctx - The transaction context object
	 * @param name - First and Last name of the user
	 * @param email - Email ID
	 * @param phoneNumber - Phone Number
	 * @param aadharNumber - Aadhar Id
	 * @returns Request Object
	*/

	async requestNewUser(ctx, name, emailId, phoneNumber, aadharNumber){

		//Creating user key using Name & Aadhar
		const requestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.request',[name, aadharNumber]);
		let dataBuffer = await ctx.stub.getState(requestKey).catch(err => console.log(err));

		if(dataBuffer.length !== 0){
			throw new Error("User already registered");
		}

		//Creating a new user object to be stored on the blockchain
		let newRequestUserObject = {
			name: name,
			emailId: emailId,
			phoneNumber: phoneNumber,
			aadharNumber: aadharNumber,
			createdAt: new Date()
		};

		//Converting the JSON object to a buffer and sending it to the Blockchain for storage
		dataBuffer = Buffer.from(JSON.stringify(newRequestUserObject));
		await ctx.stub.putState(requestKey, dataBuffer);

		//Return value of new User Request created to registrar
		return newRequestUserObject;
	}

	/**
	 * A user can recharge their account by passing their name aadhar and bank transaction id
	 * @param ctx - Transaction Context
	 * @param name - Name of the user
	 * @param aadharNumber - Aadhar Number of the user
	 * @param bankTransactionId - Id returned by bank transaction
	 * @returns UserObject
	 */

	async rechargeAccount(ctx, name, aadharNumber, bankTransactionId){
		
		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name, aadharNumber]);
		
		let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));
		
		if(userBuffer.length === 0){
			throw new Error("User isn't registered");
		}

		let userObject = JSON.parse(userBuffer.toString());

		//Validation of transaction id
		if(bankTransactionId === 'upg100'){
			userObject['upgradCoins'] = +userObject['upgradCoins'] + 100;

		} else if(bankTransactionId === 'upg500'){
			userObject['upgradCoins'] = +userObject['upgradCoins'] + 500;
		} else if(bankTransactionId === 'upg1000'){
			userObject['upgradCoins'] = +userObject['upgradCoins'] + 1000;
		} else {
			throw new Error('Invalid Bank Transaction ID');
		}

		let dataBuffer = Buffer.from(JSON.stringify(userObject));

		//Updating user detail
		await ctx.stub.putState(userKey, dataBuffer);

		return userObject;

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
	 * A user can register their property using a request
	 * @param name - Name of the user
	 * @param aadharNumber - Aadhar Number of the user
	 * @param propertyId - Unique Id referring to the propertu
	 * @param price - Cost of property
	 * @param status - Whether property is registered or for sale
	 * @returns RequestObject

	 */

	async propertyRegistrationRequest(ctx, propertyId, price, status, name, aadharNumber){

		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name, aadharNumber]);

		const requestKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.request',[propertyId]);

		let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));

		if(userBuffer.length === 0){
			throw new Error("User isn't registered");
		}

		if(price < 0){
			throw new Error("Price cannot be negative");
		}

		let requestBuffer = await ctx.stub.getState(requestKey).catch(err => console.log(err));

		if(requestBuffer.length !== 0){
			throw new Error("Request already exists");
		}

		let userObject = JSON.parse(userBuffer.toString());
		
		let newPropertyRegistrationRequest = {
			propertyId:propertyId,
			owner:userKey,
			price:price,
			status:status
		};

		let dataBuffer = Buffer.from(JSON.stringify(newPropertyRegistrationRequest));
		await ctx.stub.putState(requestKey,dataBuffer);
		return newPropertyRegistrationRequest;
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
	 * User can update their property status to on sale or registered
	 * @param ctx - Transaction Context
	 * @param propertyId - Unique identifier for the property
	 * @param name - Name of the owner
	 * @param aadharNumber - Aadhar number of the user
	 * @param status - Status of the property
	 */

	async updatePropertyStatus(ctx, propertyId, name, aadharNumber, status){

		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name, aadharNumber]);

		let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));

		if(userBuffer.length === 0){
			throw new Error("User isn't registered");
		}

		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyId]);

		let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err => console.log(err));

		if(propertyBuffer.length === 0){
			throw new Error("Property isn't registered");
		}

		let propertyObject = JSON.parse(propertyBuffer.toString());

		if(propertyObject['owner'] !== userKey){
			throw new Error("User isn't owner of this property");
		}

		propertyObject['status'] = status;

		let dataBuffer = Buffer.from(JSON.stringify(propertyObject));

		await ctx.stub.putState(propertyKey,dataBuffer);

		return propertyObject;

	}

	/**
	 * Purchase a property
	 * @param ctx - Transaction context
	 * @param propertyId - Id of the property to purchase
	 * @param name - Name of the buyer
	 * @param aadharNumber - AadharNumber of the buyer
	 */

	async purchaseProperty(ctx, propertyId, name, aadharNumber){

		const buyerKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[name, aadharNumber]);
		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyId]);

		let buyerBuffer = await ctx.stub.getState(buyerKey).catch(err => console.log(err));

		if(buyerBuffer.length === 0){
			throw new Error("Buyer isn't registered");
		}

		let buyerObject = JSON.parse(buyerBuffer.toString());
		let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err => console.log(err));

		if(propertyBuffer.length === 0){
			throw new Error("Property isn't registered");
		}

		let propertyObject = JSON.parse(propertyBuffer.toString());

		if(propertyObject['status'] !== 'onSale'){
			throw new Error("Property isn't on Sale");
		}

		if(buyerKey === propertyObject['owner']){
			throw new Error("Property cannot be bought by the owner");
		}

		if(propertyObject['price'] > buyerObject['upgradCoins']){
			throw new Error("Buyer doesn't have enough upgradCoins");
		}

		const ownerKey = propertyObject['owner'];
		let ownerBuffer = await ctx.stub.getState(ownerKey).catch(err => console.log(err));
		let ownerObject = JSON.parse(ownerBuffer.toString());

		//Property and Currency Transfer
		buyerObject['upgradCoins'] -= propertyObject['price'];
		ownerObject['upgradCoins'] = +ownerObject['upgradCoins'] + +propertyObject['price'];
		propertyObject['status'] = 'registered';
		propertyObject['owner'] = buyerKey;

		let buyerBuffer2 = Buffer.from(JSON.stringify(buyerObject));
		let ownerBuffer2 = Buffer.from(JSON.stringify(ownerObject));
		let propertyBuffer2 = Buffer.from(JSON.stringify(propertyObject));


		await ctx.stub.putState(buyerKey, buyerBuffer2);
		await ctx.stub.putState(propertyObject['owner'], ownerBuffer2);
		await ctx.stub.putState(propertyKey, propertyBuffer2);
		return propertyObject;
	}
}

module.exports = RegnetUserContract;

