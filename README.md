### Requirements
* Python v3
* Nodejs v9.5.0
* Nginx v1.13

### Run the aplications each on different terminal

* nginx

    cd nginx
    # $(pwd) is the absolute path
    nginx -p $(pwd) -c $(pwd)/nginx.conf

* api (or api-dummy)

    cd api (or api-dummy)
    pip install # to install dependencies
    FLASK_APP=api.py flask run

* search-ui

    cd search-ui
    npm install # to install dependencies
    npm start
