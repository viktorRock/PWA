var uid = "89123891231239"; // Dummy global id variable
var token = "eo4Dr8qhrFY";
var shubAPIURL = "https://storage.scrapinghub.com/items/158119/1/143?apikey=a1690d124fb0421eb1cdba5a979fd9fc&format=json";
var dataSourceUrl = 'https://docs.google.com/spreadsheets/d/1gkBUR1vXGJiXQjlGBnE_yBmWtqockPZrFV010jVM9-c/edit#gid=0headers=1&tq=';
var query, options;
var container = document.getElementById("tableSheet");
var sheetData = null;
// Load the Visualization API and the controls package.
google.charts.load('current', {'packages' : ['table']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(


 (function () {
  'use strict';

  /*****************************************************************************
 * Methods to get data from Google Sheets
 * Using Google Charts framework
 *
 ****************************************************************************/
 function initSheetsCall() {
  var queryString = encodeURIComponent('SELECT A, B, C, D, E, F LIMIT 5 OFFSET 8');
  query = new google.visualization.Query(dataSourceUrl + queryString);
}

var injectedEvent = {
  key: 1,
  label: 'HH na Sexta',
  currently: {
    Evento: 'HH no Barba',
    Organizador: 'Paulo',
    Tipo: 'transfer',
    Participantes: 12,
    Valor: 100.00,
    Status: 'Pending',
  }
};

var weatherAPIUrlBase = 'https://publicdata-weather.firebaseio.com/';

var app = {
  hasRequestPeding: false,
  isLoading: true,
  visibleCards: {},
  selectedEvents: [],
  spinner: document.querySelector('.loader'),
  cardTemplate: document.querySelector('.cardTemplate'),
  container: document.querySelector('.main'),
  addDialog: document.querySelector('.dialog-container'),
};


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/
   /* Event listener for refresh button */
   document.getElementById('butRefresh').addEventListener('click', function () {
    // console.log('getElementById - butRefresh');
    app.updateMessageCard();
  });

   /* Event listener for Clear button */
   document.getElementById('butClear').addEventListener('click', function () {
    // console.log('getElementById - butClear');
    localforage.clear();
    app.selectedEvents = [];
    app.visibleCards = {};
    app.updateMessageCard(injectedEvent);
    location.reload();
  });

   /* Event listener for add new city button */
   document.getElementById('butAdd').addEventListener('click', function () {
    // Open/show the add new city dialog
    // console.log('getElementById - butAdd');
    app.toggleAddDialog(true);
  });

   /* Event listener for add city button in add city dialog */
   document.getElementById('butAddItem').addEventListener('click', function () {
    // console.log('getElementById - butAddCity');
    var select = document.getElementById('selectItem');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.textContent;
    app.getAPIResponse(key, label);
    app.selectedEvents.push({
      key: key,
      label: label
    });
    app.toggleAddDialog(false);
    app.saveSelectedEvent();

  });

   /* Event listener for cancel button in add city dialog */
   document.getElementById('butAddCancel').addEventListener('click', function () {
    app.toggleAddDialog(false);
  });

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function (visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a  card with the latest respose. If the card
  // doesn't already exist, it's cloned from the template.
  function createTemplateClone(){
    var key = 1;
    var card = app.cardTemplate.cloneNode(true);
    card.classList.remove('cardTemplate');
    card.removeAttribute('hidden');
    app.container.appendChild(card);
    app.visibleCards[key] = card;
    return card;
  }

  app.updateMessageCard = function (data) {
    // console.log('updateForecastCard');
    var event = null;
    var card = null;

    if(data != null){
      data.forEach( function (event){
        event.key = event.c[0];
        event.name = event.c[1];
        event.host = event.c[2];
        event.type = event.c[3];
        event.qtty = event.c[4];
        event.value = event.c[5];
        event.status = event.c[6];

        card = app.visibleCards[event.key];
        if(!card)
        {
          card = createTemplateClone();
        }

        card.key = event.key;
        card.querySelector('.event').textContent = event.name;
        card.querySelector('.host').textContent = event.host;
        card.querySelector('.type').textContent = event.type;
        card.querySelector('.qtty').textContent = event.qtty;
        card.querySelector('.value').textContent = event.value;
        card.querySelector('.status').textContent = data.currently.summary;
        card.querySelector('.date').textContent =  new Date().toISOString().replace('T', ' ').replace(/\..*$/, '');

      });
    }
    
    if( app.visibleCards.length == undefined ){
      card = createTemplateClone();
    }

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };

  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  // Gets a forecast for a specific city and update the card with the data
  //Cash Then Network method
  app.getAPIResponse = function (key, label) {
     // console.log('getChatBotAPIResponse');
    // console.log('label = ' + label);
    // var url = weatherAPIUrlBase + key + '.json';
    var url = shubAPIURL

    //first getting from Cache
    if ('caches' in window) {
      caches.match(url).then(function (response) {
        if (response) {
          response.json().then(function (json) {
            // Only update if the XHR is still pending, otherwise the XHR was already returned
            if (app.hasRequestPeding) {
             app.updateMessageCard(json);
             console.log('update from cache: ' + new Date().toISOString().replace('T', ' ').replace(/\..*$/, ''));
           }
         });
        }
      });
    }

    // Make the XHR to get the data, then update the card
    app.hasRequestPeding = true;
    // var events = getArrayFromSheet();
    
    app.updateMessageCard();

    // initSheetsCall();
    // query.send(function(response){
    //   if (!response.isError()) {
    //     // Ainda não é event Driven
    //     sheetData = response.getDataTable();
    //     app.updateMessageCard(sheetData.og);
    //     console.log('update from SheetsAPI: ' + new Date().toISOString().replace('T', ' ').replace(/\..*$/, ''));
    //   }
    //   else{
    //     alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    //     sheetData = null;
    //   }
    // });
    app.hasRequestPeding = false;
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateAllMessagesCards = function () {
    // console.log('updateAllMessagesCards');
    var keys = Object.keys(app.visibleCards);
    app.getAPIResponse();
    keys.forEach(function (key) {
      var card = app.visibleCards[key];

      //console.log('textContent = ' + card.querySelector('.location').textContent);

    });
  };

  app.saveSelectedEvent = function () {
    window.localforage.setItem('eventsReturned', app.selectedEvents).then(function (value) {
      // console.log('Promises - localforage.setItem(selectedAPIs');
      // console.log('SelectedCities = ' + app.selectedEvents);
    }).catch (function (err) {
      console.log(err);
    });
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);
      if (choiceResult.outcome == 'dismissed') {
        console.log('User cancelled home screen install');
      } else {
        console.log('User added to home screen');
      }
    });
  });
  document.addEventListener('DOMContentLoaded', function () {
    window.localforage.getItem('eventsReturned').then(function (retrievedItems) {
       // console.log('Promises - localforage.getItem(selectedCities)');
       // console.log(retrievedItems)
       if (retrievedItems == null) {
        // console.log('empty SelectedCities')
        app.updateAllMessagesCards(injectedEvent);
        app.selectedEvents.push(injectedEvent);
        app.saveSelectedEvent();
      } else {
        app.selectedEvents = retrievedItems
        app.selectedEvents.forEach(function (data) {
          app.getAPIResponse(data.key, data.label)
        })
      }
    });
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('/service-worker.js')
    .then(function() { 
        // console.log('Service Worker Registered'); 
      });
  }

})());
