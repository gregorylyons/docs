//region client_1
const { DocumentStore } = require('ravendb');

const store = DocumentStore.create(
    ['http://live-test.ravendb.net'],   // URL to the Server
                                        // or list of URLs
                                        // to all Cluster Servers (Nodes)

    'Northwind');                       // Default database that DocumentStore will interact with

const conventions = store.conventions;  // DocumentStore customizations

store.initialize();                     // Each DocumentStore needs to be initialized before use.
                                        // This process establishes the connection with the Server
                                        // and downloads various configurations
                                        // e.g. cluster topology or client configuration

await store.dispose();                  // Dispose the resources claimed by the DocumentStore
//endregion

class Category {
    constructor(name) {
        this.Id = null;
        this.Name = name;
    }
}

class Product {
    constructor(name, categoryId, unitsInStock) {
        this.Id = null;
        this.Name = name;
        this.Category = categoryId;
        this.UnitsInStock = unitsInStock;
    }
}

function c2() {
    //region client_2
    const session = store.openSession();                // Open a session for a default 'Database'

    let category = new Category("Database Category");

    await session.store(category);                      // Assign an 'Id' and collection (Categories)
                                                        // and start tracking an entity

    let product = new Product(
        "RavenDB Database",
        category.Id, 
        10);

    await session.store(product);                       // Assign an 'Id' and collection (Products)
                                                        // and start tracking an entity

    await session.saveChanges();                        // Send to the Server
                                                        // one request processed in one transaction
    //endregion
}

function c2(productId) {
    //region client_3
    const session = store.openSession();                // Open a session for a default 'Database'

    let product = await session
        .include('Category')                            // Include Category
        .load(productId)                                // Load the Product and start tracking

    let category = await session
        .load(product.Category);                        // No remote calls,
                                                        // Session contains this entity from .include

    product.Name = 'RavenDB';                           // Apply changes
    category.Name = 'Database';

    await session.saveChanges();                        // Synchronize with the Server
                                                        // one request processed in one transaction
    //endregion
}

function c3() {
    //region client_4
    const session = store.openSession();                // Open a session for a default 'Database'

    let productNames = await session
        .query({ collection: 'Products' })              // Query for Products
        .whereGreaterThan('UnitsInStock', 5)            // Filter
        .skip(0).take(10)                               // Page
        .selectFields(["Name"])                         // Project
        .all();                                         // Materialize query
    //endregion
}