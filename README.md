#MPFinder  
MPFinder is a geolocation tool that pulls in data from postcode APIs and UK Parliament to display contact details for your local MP.  

##Adapting to your country  
*Note: This wasn't designed with open-sourcing or other countries in mind, although I've tried my best to make the process simpler. There may be demons...*  
1) Get the data of your local representatives, in JSON format. This needs to include contact details and their constituency name. This should be saved as data.json.  
2) Find an API to use for post/zip codes. We convert the lat/long provided by local geolocation APIs into a postcode using a service based on UK-Postcodes.  
3) Pop the URLs into the config array. Update the structure of the URLs throughout main.js as required (Cmd+F latlangBaseUrl and update, for example)  
4) Update the data rendering. You should have to update a couple of the ways to make URL requests and extract JSON in the *localised* set of functions to your dataset - the *all* set should be country-agnostic.  
5) Once it's working, tweet me a link! (@mightyshakerjnr)
