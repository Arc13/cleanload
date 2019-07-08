# CleanLoad - Fully Customizable Loading Screen
<p align="center">
  <img src="https://i.imgur.com/IAlFqGY.png">
</p>

## Features
- **Administration panel**: Modify your loading screen without the pain of manually editing its config file
- **Fully customizable**: Customize every bit of your loading screen
- **Blur effect**: Optional blurred background behind your bubbles, even compatible with Awesomium
- **First launch screen**: Helps you through the first setup process and its steps for a painless set-up
- **Cache system**: Under the hood tricks to improve the speed of the loading screen, to be the fastest
- **Lightweight**: Designed not to impact user loading speed
- **Link manager**: Let your users easily get to your links, such as forums and social networks, by scanning a simple QR Code
- **Background manager**: Upload, delete and select your active background or the order they will arrive in carousel mode
- **Music manager**: Upload, delete, change the volume, organize and set the details of your music
- **Rich text editor**: Edit the main text shown to your users as you would do in an advanced text editor: change text justification, color, and even insert images very easily
- **Selectable themes**: Choose between preconfigured colored themes, or create your own custom one
- **Background image modes**: Have a static, random, or even changing background image displayed
- **Bubble organization**: Hide any bubble you don't want, and move the displayed ones around
- **Custom header**: Choose to show player information, server information and the QR Code in the header
- **Bubble corners**: Are you into squares, or maybe into rounded corners? You can change that too!

## Requirements
- Webserver with at least PHP 5.x
- PHP setting `allow_url_fopen` enabled

## Installation
- Connect to your web server
- Create a folder named `CleanLoad`
- Upload the content of the downloaded .zip file to this folder
- In the newly created `CleanLoad` folder, follow the instructions in the `config.php` file to configure your Steam API key as well as your login credentials for the admin panel
- In the same folder, make sure the `cache`, `background` and `musics` folders have their permission set to **775** (if you are using FileZilla, right-click the folders, then click "File permissions..."
- In `CleanLoad/admin`, make sure the `submit.php` file has its permission set to **655**
- In `CleanLoad/scripts`, make sure the `FileCache.php` file has its permission set to **655**
- *Optional step*, if you’re using a VPS: Change the owner of every file to `www-data:www-data`:
```
sudo chown -R www-data:www-data CleanLoad/
```
- Open a web browser, go to *yourserver.com/CleanLoad*, where *yourserver.com* is the address of your web server, to begin the first launch configuration and verify that everything is correct

## Screenshots
![Main Screen](https://i.imgur.com/Sfps1gQ.png)
![Admin Panel - General](https://i.imgur.com/7UzJE0G.png)
More screenshots are available [here](https://imgur.com/a/RR9R0ZI).
