// ==UserScript==
// @name         JPDB Hide Kanji and Show Furigana with Settings Option
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Adds an option in the jpdb.io settings page and learn page to hide kanji on the review page, saving the setting in localStorage
// @match        https://jpdb.io/review*
// @match        https://jpdb.io/settings*
// @match        https://jpdb.io/learn*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    var hideKanjiEnabled;

    function init() {
        // Determine which page we're on
        var currentURL = window.location.href;

        if (currentURL.includes('/learn')) {
            // We're on the learn page
            initLearnPage();
        } else if (currentURL.includes('/settings')) {
            // We're on the settings page
            initSettingsPage();
        } else if (currentURL.includes('/review')) {
            // We're on the review page
            initReviewPage();
        }
    }

    // Initialize the settings page modifications
    function initSettingsPage() {
        // Initialize hideKanjiEnabled from localStorage
        hideKanjiEnabled = localStorage.getItem('hideKanjiEnabled');
        if (hideKanjiEnabled === null) {
            // If not set in localStorage, default to false
            hideKanjiEnabled = false;
        } else {
            // Convert the string back to boolean
            hideKanjiEnabled = (hideKanjiEnabled === 'true');
        }

        // Add the checkbox to the settings page
        addSettingsOption();
    }

    // Initialize the learn page modifications
    function initLearnPage() {
        // Initialize hideKanjiEnabled from localStorage
        hideKanjiEnabled = localStorage.getItem('hideKanjiEnabled');
        if (hideKanjiEnabled === null) {
            // If not set in localStorage, default to false
            hideKanjiEnabled = false;
        } else {
            // Convert the string back to boolean
            hideKanjiEnabled = (hideKanjiEnabled === 'true');
        }

        // Add the checkbox to the learn page
        addLearnPageOption();
    }

    // Initialize the review page modifications
    function initReviewPage() {
        // Initialize hideKanjiEnabled from localStorage
        hideKanjiEnabled = localStorage.getItem('hideKanjiEnabled');
        if (hideKanjiEnabled === null) {
            // If not set in localStorage, default to false
            hideKanjiEnabled = false;
        } else {
            // Convert the string back to boolean
            hideKanjiEnabled = (hideKanjiEnabled === 'true');
        }

        // Run hideKanji if enabled
        if (hideKanjiEnabled) {
            hideKanji();

            // Set up a MutationObserver to watch for changes in the content
            observeContentChanges();
        }
    }

    // Function to add the setting to the settings page
    function addSettingsOption() {
        // Wait for the settings form to be available
        var settingsForm = document.querySelector('form[action="/settings"]');

        if (settingsForm) {
            // Create the checkbox container div
            var checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'checkbox';

            // Create the checkbox input
            var checkboxInput = document.createElement('input');
            checkboxInput.type = 'checkbox';
            checkboxInput.id = 'hide-kanji-option';
            checkboxInput.name = 'hide-kanji-option';
            checkboxInput.checked = hideKanjiEnabled;

            // Create the label for the checkbox
            var checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = 'hide-kanji-option';
            checkboxLabel.textContent = 'Hide kanji on the review page and show only furigana';

            // Append the input and label to the div
            checkboxDiv.appendChild(checkboxInput);
            checkboxDiv.appendChild(checkboxLabel);

            // Find the <h6> heading "Kanji learning configuration"
            var headings = settingsForm.querySelectorAll('h6');
            var insertAfter = null;

            for (var i = 0; i < headings.length; i++) {
                if (headings[i].textContent.trim() === 'Kanji learning configuration') {
                    insertAfter = headings[i];
                    break;
                }
            }

            if (insertAfter) {
                // Insert the checkboxDiv after the heading
                insertAfter.parentNode.insertBefore(checkboxDiv, insertAfter.nextSibling);
            } else {
                // If the heading is not found, append to the form
                settingsForm.appendChild(checkboxDiv);
            }

            // Add an event listener to the checkbox to save the setting
            checkboxInput.addEventListener('change', function() {
                hideKanjiEnabled = checkboxInput.checked;
                localStorage.setItem('hideKanjiEnabled', hideKanjiEnabled);
            });
        } else {
            // If the settings form is not found, try again after a delay
            setTimeout(addSettingsOption, 500);
        }
    }

    // Function to add the setting to the learn page
    function addLearnPageOption() {
        // Wait for the learn page content to be available
        var targetForm = document.querySelector('form[action="/review#a"]');

        if (targetForm) {
            // Create the container div
            var containerDiv = document.createElement('div');
            containerDiv.style.display = 'flex';
            containerDiv.style.alignItems = 'center';
            containerDiv.style.marginTop = '1rem';
            containerDiv.style.marginBottom = '0.5rem';

            // Create the checkbox input
            var checkboxInput = document.createElement('input');
            checkboxInput.type = 'checkbox';
            checkboxInput.id = 'hide-kanji-option';
            checkboxInput.name = 'hide-kanji-option';
            checkboxInput.checked = hideKanjiEnabled;
            checkboxInput.style.marginRight = '0.5rem';

            // Create the label for the checkbox
            var checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = 'hide-kanji-option';
            checkboxLabel.textContent = 'Hide kanji on the review page and show only furigana';

            // Append the input and label to the container div
            containerDiv.appendChild(checkboxInput);
            containerDiv.appendChild(checkboxLabel);

            // Insert the container div above the target form
            targetForm.parentNode.insertBefore(containerDiv, targetForm);

            // Add an event listener to the checkbox to save the setting
            checkboxInput.addEventListener('change', function() {
                hideKanjiEnabled = checkboxInput.checked;
                localStorage.setItem('hideKanjiEnabled', hideKanjiEnabled);
            });
        } else {
            // If the target form is not found, try again after a delay
            setTimeout(addLearnPageOption, 500);
        }
    }

    // Function to observe content changes and reapply hideKanji
    function observeContentChanges() {
        // Select the node that contains the content (adjust the selector as needed)
        var targetNode = document.querySelector('#main') || document.body;

        // Options for the observer (which mutations to observe)
        var config = { childList: true, subtree: true };

        // Callback function to execute when mutations are observed
        var callback = function(mutationsList, observer) {
            for (var mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // Re-run hideKanji when new nodes are added
                    hideKanji();
                }
            }
        };

        // Create an observer instance linked to the callback function
        var observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    }

    // Modified hideKanji function
    function hideKanji() {
        // Find all ruby elements
        var rubyElements = document.querySelectorAll('ruby');

        rubyElements.forEach(function(ruby) {
            // Skip if already processed
            if (ruby.getAttribute('data-hide-kanji-processed')) return;

            // Get the furigana (rt elements)
            var rtElements = ruby.querySelectorAll('rt');
            var furiganaText = '';

            rtElements.forEach(function(rt) {
                furiganaText += rt.textContent;
            });

            // Create a text node with the furigana readings
            var furiganaNode = document.createTextNode(furiganaText);

            // Replace the ruby element with the furigana text node
            ruby.parentNode.replaceChild(furiganaNode, ruby);

            // Mark as processed
            ruby.setAttribute('data-hide-kanji-processed', 'true');
        });
    }

    // Run the script after the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
