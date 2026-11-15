# sky check

a small weather page by Uzma Moin for inm420. it makes one rest api call to
[weatherapi.com](https://www.weatherapi.com/) and shows the current temperature,
a short description and the weather icon for the city picked in the dropdown.

## features

- dropdown with four cities (toronto, mumbai, sydney, reykjavik)
- shows temperature, description, weather icon, feels like, humidity, wind and local time
- degrees c / f toggle that redraws without another request
- background colour changes with the weather and day or night
- remembers the last city and unit
- loading and error messages, mobile first layout

## setup

1. get a free key at https://www.weatherapi.com/signup.aspx
2. open `js/main.js` and replace `YOUR_API_KEY_HERE` with your key
3. open `index.html` in a browser (or run `npm install` then `npm start`)

## structure

- index.html
- css/styles.css
- js/main.js
