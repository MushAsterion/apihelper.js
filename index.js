'use-strict';

const http = require('http');
const https = require('https');

/**
 * An helper to facilitate API calls.
 */
class APIHelper {
    /**
     * Creates an API facilitator.
     *
     * @param {{"protocol": "https"|"http", "hostname": string}} [requestOptions] - Options for the requests.
     * @param {Object.<string, string>} [headers] - Headers for the requests.
     */
    constructor(requestOptions, headers) {
        this.headers = Object.assign({}, headers);
        this.requestOptions = Object.assign({}, requestOptions);
    }

    /**
     * Set new headers.
     *
     * @param {string} key - The header key.
     * @param {string} [value] - The value to set the key to. Undefined will delete the header.
     */
    setHeader(key, value) {
        if (value === '' || value === undefined) {
            return this.deleteHeader(key);
        }
        else { this.headers[key] = value; } 
    }

    /**
     * Deletes header.
     *
     * @param {string} key - The header key.
     */
    deleteHeader(key) {
        delete this.headers[key];
    }

    /**
     * Make a fetch request to the API.
     *
     * @param {{ "protocol": "https"|"http", "hostname": string, "port": string, "path": string, "method": "GET"|"POST"|"PATCH"|"PUT"|"DELETE", headers: { "Authorization": string } }} requestOptions - Options for the request.
     * @param {string} [data] - The data to send, if any.
     * @returns {Promise<string|object>} The fetched data.
     */
    request(requestOptions, data = '') {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }

        return new Promise((resolve, reject) => {
            try {
                let request = ((requestOptions.protocol || this.requestOptions.protocol) === 'https' ? https : http).request({
                    'hostname': requestOptions.hostname || this.requestOptions.hostname,
                    'port': requestOptions.port,
                    'path': (requestOptions.path[0] !== '/' ? '/' : '') + requestOptions.path,
                    'method': [ 'GET', 'POST', 'PATCH', 'PUT', 'DELETE' ].includes(requestOptions.method) ? requestOptions.method : 'GET',
                    'headers': Object.assign(Object.assign(requestOptions.method === 'GET' ? {} : { 'Content-Length': data.length }, this.headers), requestOptions.headers)
                }, (data) => {
                    let update = '';
            
                    data.on('data', d => update += d);
                    data.on('error', err => reject(err));
                    data.on('end', () => {
                        try { update = JSON.parse(update); }
                        catch(err) { }
    
                        resolve(update);
                    });
                });

                request.on('error', reject);
            
                if (requestOptions.method !== 'GET') {
                    request.write(data);
                }
                request.end();
            }
            catch(err) { reject(err); }
        });
    }

    /**
     * Makes a GET request.
     *
     * @param {{ "protocol": "https"|"http", "hostname": string, "port": string, "path": string, "headers": { "Authorization": string } }} requestOptions - Options for the request.
     * @param {string} [data] - The data to send.
     * @returns {Promise<string|object>} The fetched data.
     */
    GET(requestOptions, data = '') {
        return this.request(Object.assign({ 'method': 'GET' }, requestOptions), data);
    }

    /**
     * Makes a POST request.
     *
     * @param {{ "protocol": "https"|"http", "hostname": string, "port": string, "path": string, "headers": { "Authorization": string, "Content-Type": string } }} requestOptions Options for the request.
     * @param {string} [data] The data to send.
     * @returns {Promise<string|object>} The result of the request.
     */
    POST(requestOptions, data = '') {
        return this.request(Object.assign({ 'method': 'POST' }, requestOptions), data);
    }

    /**
     * Makes a PATCH request.
     *
     * @param {{ "protocol": "https"|"http", "hostname": string, "port": string, "path": string, "headers": { "Authorization": string, "Content-Type": string } }} requestOptions Options for the request.
     * @param {string} [data] The data to send.
     * @returns {Promise<string|object>} The result of the request.
     */
    PATCH(requestOptions, data = '') {
        return this.request(Object.assign({ 'method': 'PATCH' }, requestOptions), data);
    }

    /**
     * Makes a PUT request.
     *
     * @param {{ "protocol": "https"|"http", "hostname": string, "port": string, "path": string, "headers": { "Authorization": string, "Content-Type": string } }} requestOptions Options for the request.
     * @param {string} [data] The data to send.
     * @returns {Promise<string|object>} The result of the request.
     */
    PUT(requestOptions, data = '') {
        return this.request(Object.assign({ 'method': 'PUT' }, requestOptions), data);
    }

    /**
     * Makes a DELETE request.
     *
     * @param {{ "protocol": "https"|"http", "hostname": string, "port": string, "path": string, "headers": { "Authorization": string, "Content-Type": string } }} requestOptions Options for the request.
     * @param {string} [data] The data to send.
     * @returns {Promise<string|object>} The result of the request.
     */
    DELETE(requestOptions, data = '') {
        return this.request(Object.assign({ 'method': 'DELETE' }, requestOptions), data);
    }
}

module.exports = { APIHelper };