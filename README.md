# IsThisPhish: Machine Learning-Based Chrome Extension for Phishing Website Detection

Machine Learning-Based Chrome Extension for Phishing Website Detection. 
This project has been made to fulfilled the requirement for bachelor thesis and only cover the basic necessity.
Further development and research is needed to improve the accuracy and precision to detect phishing site and reduce false positive.

## Hash Integrity

IsThisPhish.zip
SHA256: 9A0FCA000FED5F8B039898DFCED910B5E1AC89289D85B353057161898D2164A9

## Installation

The extension distribution will come in local and Chrome Webstore soon. 

For Local Distribution:
1. Download the zip file, place in specific folder, and unzip it.
2. Access chrome://extensions in your Chrome Browser and turn on Developer Mode on the right upper side.
3. Click the button “Load Unpacked”, go to the folder of the extracted zip file, and select folder on it.
4. Now it's works!
5. Read the Documentation below to ensure how it really works on your browser!

## Documentation

### How does the extensions works?

While you surfing through the Internet and access some websites, the extension will send the URLs and predict based on pattern defined from URLs and its content features. If the website suspected as phishing website, it will attempt to block the website from further access. But don't worry! You can still access the website if you're sure it is not a phishing website using 'Continue with Caution' feature, give feedback through Extension Popup, or add the domain to Whitelist feature!

### Popup

Extension popup used to do an overview on the URLs and its location, also you can give feedback when accessing the URLs that may indicate a wrong call of predictions. Access it by:
1. Click the extension icon  on the upper right side of the browser.
2. Click “IsThisPhish” extension name and popup will be shown!
3. Report URLs that indicated as false predictions with comments or without comment by click submit!

### Whitelist

If you're tired of your favorite website being blocked so often, then here it comes the Whitelist Feature to help you unblocked the website by put the domain there and no need to worry to being blocked again! Access it:
1. Click the extension icon  on the upper right side of the browser.
2. Click the menu  and select Options. Input the domain name to put it on whitelist!
3. Click remove button  to remove the domain from whitelist anytime!