
/** @namespace */
var WebDiagnostics = function () {
    var baseUrl = '/';

    return {
        /**
         * Base URL used for resolving virtual apps or root sites
         * Update from server-side or hard-code in private property
         * Example: WebDiagnostics.baseUrl = '/myapp'
         */
        baseUrl: baseUrl,
        
        /**
         * Converts a URL into one that is usable on the requesting client.
         * @param {string} The virtual path to resolve, such as ~/SomePage
         * @returns {string} The full relative path including root application path
         */
        resolveUrl: function (url) {
            //if (url && url.indexOf('~/') === 0) {
            //    url = _.rtrim(this.baseUrl, '/') + '/' + _.ltrim(url, '~/');
            //}

            return url;
        },

        /*
         * Non-destructively attempts to create a namespace.
         * Will not overwrite existing properties. May fail if an existing property in the path is immutable.
         * @param {string} The namespace to define, e.g. 'WebDiagnostics.MyNamespace'
         * @returns {object} The last / most specific / rightmost namespace
         */
        defineNamespace: function(namespace) {
            function throwException(namespaces) {
                throw {
                    name: 'AssertionFailed',
                    message: 'Namespace assignment failed. "' + namespaces.join('.') + '" is probably an immutable object.'
                };
            }

            if (!namespace) return;
            var namespaces = namespace.split('.');
            var parent = window;
            for (var i = 0, length = namespaces.length; i < length; i++) {
                var ns = namespaces[i];
                if (parent[ns] === undefined)
                    parent[ns] = {};
                if (parent[ns] === undefined)
                    throwException(namespaces.slice(0, i));
                parent = parent[ns];
            }

            parent.mutabilityTest = true;
            if (parent.mutabilityTest === undefined)
                throwException(namespaces);
            delete parent.mutabilityTest;
            return parent;
        }
    };
}();
