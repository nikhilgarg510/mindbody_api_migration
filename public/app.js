// MindBody API Testing Interface
class MindBodyAPITester {
    constructor() {
        this.apiEndpoints = {
            'GetClients': {
                description: 'Retrieve client information by email address',
                parameters: {
                    'email': { type: 'text', label: 'Email Address', placeholder: 'client@example.com', required: false },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'AddOrUpdateClients': {
                description: 'Add a new client or update an existing one',
                parameters: {
                    'fname': { type: 'text', label: 'First Name', placeholder: 'John', required: true },
                    'lname': { type: 'text', label: 'Last Name', placeholder: 'Doe', required: true },
                    'email': { type: 'email', label: 'Email Address', placeholder: 'john.doe@example.com', required: true },
                    'birthdate': { type: 'date', label: 'Birth Date', required: false },
                    'street1': { type: 'text', label: 'Street Address', placeholder: '123 Main St', required: false },
                    'city': { type: 'text', label: 'City', placeholder: 'New York', required: false },
                    'state': { type: 'text', label: 'State', placeholder: 'NY', required: false },
                    'zip': { type: 'text', label: 'ZIP Code', placeholder: '10001', required: false },
                    'phone': { type: 'tel', label: 'Phone Number', placeholder: '+1234567890', required: true },
                    'phone_carrier': {
                        type: 'select',
                        label: 'Phone Carrier',
                        options: [
                            '', 'None', '48', 'Alaska Communications', 'Appalachian Wireless', 'Assurance Wireless',
                            'AT&T', 'Bell Canada', 'BlueGrass Cellular', 'Boost', 'Cellcom', 'Chatmobility',
                            'ChatR', 'Cincinnati Bell', 'Cingular', 'Cricket', 'Cspire', 'Digicel',
                            'EE *(Everytime Everywhwere)', 'Family Mobile by Walmart', 'Fido', 'GCI',
                            'Google Voice', 'H20', 'H20 Wireless', 'iWireless', 'Koodo', 'Koodo Mobile',
                            'MTS - Manitoba Telecom Services', 'MTS Telekom Srbija', 'Net 10', 'Nextel',
                            'O2 & Three', 'Poineer Cellular', 'Primus', 'Rogers', 'Sasktel', 'Simplemobile',
                            'Sprint', 'Straighttalk', 'Talk Talk', 'Telenor Srbija', 'Telstra', 'Telstra AU',
                            'Telus', 'Telus Mobility', 'THREE', 'Thumb Cellular', 'Ting GSM', 'T-Mobile',
                            'tracfone', 'Union Wireless', 'US Cellular', 'Verizon', 'Viaero', 'Virgin Mobile',
                            'Virgin Mobile Canada', 'Vodafone', 'Vodafone Romania', 'Wind Mobile'
                        ],
                        required: false
                    },
                    'id': { type: 'text', label: 'Client ID (for updates)', placeholder: 'ABC123-XYZ', required: false },
                    'gender': { type: 'select', label: 'Gender', options: ['', 'Male', 'Female', 'Other'], required: true },
                    'emergency_contact_email': { type: 'email', label: 'Emergency Contact Email', placeholder: 'emergency@example.com', required: true },
                    'emergency_contact_name': { type: 'text', label: 'Emergency Contact Name', placeholder: 'Jane Doe', required: true },
                    'emergency_contact_phone': { type: 'tel', label: 'Emergency Contact Phone', placeholder: '+1234567890', required: true },
                    'emergency_contact_relationship': { type: 'text', label: 'Emergency Contact Relationship', placeholder: 'Spouse', required: true },
                    'referred_by': { type: 'text', label: 'Referred By', placeholder: 'John Smith', required: false },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'GetServices': {
                description: 'Retrieve available services, optionally filtered by class or service ID',
                parameters: {
                    'class_id': { type: 'number', label: 'Class ID (optional)', placeholder: '123', required: false },
                    'service_id': { type: 'number', label: 'Service ID (optional)', placeholder: '456', required: false },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'GetClientServices': {
                description: 'Get services associated with a specific client',
                parameters: {
                    'client_id': { type: 'text', label: 'Client ID', placeholder: 'ABC123-XYZ', required: true },
                    'class_id': { type: 'number', label: 'Class ID', placeholder: '456', required: true },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'UpdateClientServices': {
                description: 'Update client service details like active and expiration dates',
                parameters: {
                    'client_service_id': { type: 'text', label: 'Client Service ID', placeholder: 'CS789-ABC', required: true },
                    'active_date': { type: 'datetime-local', label: 'Active Date', required: false },
                    'expiration_date': { type: 'datetime-local', label: 'Expiration Date', required: false },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'CheckoutShoppingCart': {
                description: 'Process a checkout for services in the shopping cart',
                parameters: {
                    'client_id': { type: 'text', label: 'Client ID', placeholder: 'ABC123-XYZ', required: true },
                    'service_id': { type: 'number', label: 'Service ID', placeholder: '456', required: true },
                    'amount': { type: 'number', label: 'Amount', placeholder: '99.99', step: '0.01', required: true },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'GetClasses': {
                description: 'Retrieve class information with optional filters',
                parameters: {
                    'location_id': { type: 'number', label: 'Location ID', placeholder: '1', required: false },
                    'class_id': { type: 'number', label: 'Class ID', placeholder: '123', required: false },
                    'start_date': { type: 'datetime-local', label: 'Start Date', required: false },
                    'end_date': { type: 'datetime-local', label: 'End Date', required: false },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'GetClassSchedules': {
                description: 'Get class schedules for a location and date range',
                parameters: {
                    'location_id': { type: 'number', label: 'Location ID', placeholder: '1', required: true },
                    'start_date': { type: 'datetime-local', label: 'Start Date', required: true },
                    'end_date': { type: 'datetime-local', label: 'End Date', required: true },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'GetClassVisits': {
                description: 'Get visit information for a specific class',
                parameters: {
                    'class_id': { type: 'number', label: 'Class ID', placeholder: '123', required: true },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'GetSites': {
                description: 'Retrieve all available sites, optionally filtered by site IDs',
                parameters: {
                    'siteIds': { type: 'text', label: 'Site IDs (comma-separated)', placeholder: '1,2,3', required: false }
                }
            },
            'GetLocations': {
                description: 'Retrieve all available locations',
                parameters: {
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'AddClientsToClasses': {
                description: 'Add clients to specific classes',
                parameters: {
                    'client_id': { type: 'text', label: 'Client ID', placeholder: 'ABC123-XYZ', required: true },
                    'class_id': { type: 'number', label: 'Class ID', placeholder: '456', required: true },
                    'client_service_id': { type: 'text', label: 'Client Service ID (optional)', placeholder: 'CS789-ABC', required: false },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'RemoveClientsFromClasses': {
                description: 'Remove clients from specific classes',
                parameters: {
                    'client_id': { type: 'text', label: 'Client ID', placeholder: 'ABC123-XYZ', required: true },
                    'class_id': { type: 'number', label: 'Class ID', placeholder: '456', required: true },
                    'late_cancel': { type: 'checkbox', label: 'Late Cancel', required: false },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'VoidClientService': {
                description: 'Void a client service by setting past dates (expires the service)',
                parameters: {
                    'client_service_id': { type: 'text', label: 'Client Service ID', placeholder: 'CS789-ABC', required: true },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            },
            'GetClientSchedule': {
                description: 'Get a client\'s booked classes and schedule for a date range',
                parameters: {
                    'client_id': { type: 'text', label: 'Client ID', placeholder: 'ABC123-XYZ', required: true },
                    'start_date': { type: 'datetime-local', label: 'Start Date (optional)', required: false },
                    'end_date': { type: 'datetime-local', label: 'End Date (optional)', required: false },
                    'siteId': { type: 'number', label: 'Site ID (optional)', placeholder: '1', required: false }
                }
            }
        };

        this.init();
    }

    init() {
        this.populateApiSelect();
        this.bindEvents();
    }

    populateApiSelect() {
        const select = document.getElementById('apiSelect');
        Object.keys(this.apiEndpoints).forEach(apiName => {
            const option = document.createElement('option');
            option.value = apiName;
            option.textContent = apiName;
            select.appendChild(option);
        });
    }

    bindEvents() {
        document.getElementById('apiSelect').addEventListener('change', (e) => {
            this.handleApiSelection(e.target.value);
        });

        // Handle version selection change
        document.querySelectorAll('input[name="apiVersion"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateButtonText();
            });
        });

        document.getElementById('compareBtn').addEventListener('click', () => {
            this.compareAPIs();
        });
    }

    handleApiSelection(apiName) {
        const compareBtn = document.getElementById('compareBtn');
        const dynamicFields = document.getElementById('dynamicFields');
        const apiDescription = document.getElementById('apiDescription');

        if (!apiName) {
            compareBtn.disabled = true;
            dynamicFields.innerHTML = '<div class="empty-state">Select an API endpoint to see available parameters</div>';
            apiDescription.style.display = 'none';
            return;
        }

        const endpoint = this.apiEndpoints[apiName];

        // Show API description
        apiDescription.innerHTML = `<i class="fas fa-info-circle"></i> ${endpoint.description}`;
        apiDescription.style.display = 'block';

        // Generate dynamic fields
        dynamicFields.innerHTML = '';

        if (Object.keys(endpoint.parameters).length === 0) {
            dynamicFields.innerHTML = '<div class="empty-state">This API requires no parameters</div>';
        } else {
            Object.entries(endpoint.parameters).forEach(([paramName, paramConfig]) => {
                const fieldRow = this.createFieldRow(paramName, paramConfig);
                dynamicFields.appendChild(fieldRow);
            });
        }

        compareBtn.disabled = false;

        // Update button text based on version selection
        this.updateButtonText();
    }

    updateButtonText() {
        const compareBtn = document.getElementById('compareBtn');
        const selectedVersion = document.querySelector('input[name="apiVersion"]:checked')?.value || 'both';

        let buttonText, buttonIcon;
        switch (selectedVersion) {
            case 'v5':
                buttonText = 'Call V5 API';
                buttonIcon = 'fas fa-soap';
                break;
            case 'v6':
                buttonText = 'Call V6 API';
                buttonIcon = 'fas fa-code';
                break;
            case 'both':
            default:
                buttonText = 'Compare APIs';
                buttonIcon = 'fas fa-rocket';
                break;
        }

        compareBtn.innerHTML = `<i class="${buttonIcon}"></i> ${buttonText}`;
    }

    createFieldRow(paramName, config) {
        const fieldRow = document.createElement('div');
        fieldRow.className = 'field-row';

        const label = document.createElement('div');
        label.className = 'field-label';
        label.innerHTML = `${config.label}${config.required ? ' <span style="color: #dc3545;">*</span>' : ''}`;

        const inputContainer = document.createElement('div');
        let input;

        switch (config.type) {
            case 'select':
                input = document.createElement('select');
                input.className = 'form-control';
                config.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option || 'Select...';
                    input.appendChild(optionElement);
                });
                break;
            case 'checkbox':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.style.transform = 'scale(1.2)';
                break;
            default:
                input = document.createElement('input');
                input.type = config.type;
                input.className = 'form-control';
                if (config.placeholder) input.placeholder = config.placeholder;
                if (config.step) input.step = config.step;
        }

        input.id = `param_${paramName}`;
        input.dataset.paramName = paramName;
        input.dataset.required = config.required || false;

        inputContainer.appendChild(input);
        fieldRow.appendChild(label);
        fieldRow.appendChild(inputContainer);

        return fieldRow;
    }

    collectParameters() {
        const params = {};
        const inputs = document.querySelectorAll('#dynamicFields input, #dynamicFields select');

        inputs.forEach(input => {
            const paramName = input.dataset.paramName;
            const isRequired = input.dataset.required === 'true';
            let value = input.value;

            if (input.type === 'checkbox') {
                value = input.checked;
            }

            if (value !== '' && value !== null) {
                // Convert numeric strings to numbers for number inputs
                if (input.type === 'number' && value !== '') {
                    value = parseFloat(value);
                }
                params[paramName] = value;
            } else if (isRequired) {
                throw new Error(`Required field "${paramName}" is missing`);
            }
        });

        return params;
    }

    async compareAPIs() {
        const apiEndpoint = document.getElementById('apiSelect').value;
        const selectedVersion = document.querySelector('input[name="apiVersion"]:checked').value;

        console.log('🚀 compareAPIs started');
        console.log('Selected API:', apiEndpoint);
        console.log('Selected version:', selectedVersion);

        if (!apiEndpoint) {
            console.log('❌ No API endpoint selected');
            return;
        }

        try {
            const params = this.collectParameters();
            console.log('✅ Parameters collected:', params);
            console.log('Making API comparison request:', { apiEndpoint, params, version: selectedVersion });

            // Show loading state and clear any previous errors
            this.showLoading(true, selectedVersion);
            this.clearError(); // Clear any previous error messages
            this.hideResults();

            // Quick health check first to verify server connectivity
            try {
                console.log('Performing health check...');
                const healthResponse = await fetch('/health', { method: 'GET' });
                console.log('Health check response:', healthResponse.status, healthResponse.ok);
                if (!healthResponse.ok) {
                    console.warn('Health check failed, but continuing with API request');
                }
            } catch (healthError) {
                console.error('Health check failed:', healthError);
                // Don't throw here, just log and continue
            }

            console.log('Sending fetch request to /api/compare...');

            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout (longer than server timeout)

            const response = await fetch('/api/compare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiEndpoint,
                    params,
                    version: selectedVersion
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('Fetch response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            // Handle HTTP errors (not network errors)
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.error('Server error response:', errorData);
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                }
                throw new Error(`HTTP_ERROR: ${errorMessage}`);
            }

            console.log('About to parse JSON response...');
            let data;
            try {
                data = await response.json();
                console.log('API comparison response parsed successfully:', data);
                console.log('Response structure check:', {
                    hasComparison: !!data.comparison,
                    comparisonKeys: data.comparison ? Object.keys(data.comparison) : null,
                    v5Status: data.comparison?.v5?.status,
                    v6Status: data.comparison?.v6?.status
                });
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                console.error('Response text (first 500 chars):', await response.text().catch(() => 'Could not get response text'));
                throw new Error(`JSON_PARSE_ERROR: ${jsonError.message}`);
            }

            // Even if there are individual API failures, we can still display results
            if (data && data.comparison) {
                console.log('Valid response received, calling displayResults');
                this.displayResults(data.comparison);
                console.log('displayResults completed');
            } else {
                console.error('Invalid response structure:', data);
                console.error('Expected data.comparison but got:', typeof data, data);
                throw new Error('Invalid response format from server');
            }

        } catch (error) {
            console.log('🚨 Error caught in compareAPIs:', error);
            this.clearError(); // Clear any previous error messages
            console.error('API comparison error:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            // More specific error detection
            if (error.name === 'AbortError') {
                console.warn('Request was aborted due to timeout');
                this.showError('Request timeout: The server is taking too long to respond. Please try again.');
            } else if (error instanceof TypeError &&
                (error.message.toLowerCase().includes('fetch') ||
                    error.message.toLowerCase().includes('network') ||
                    error.message.toLowerCase().includes('failed to fetch'))) {
                console.warn('Detected actual network error - server is not reachable');
                this.showError('Network error: Cannot connect to server. Please check if the server is running.');
            } else if (error.message.startsWith('HTTP_ERROR:')) {
                // This is an HTTP error, not a network error
                const httpError = error.message.replace('HTTP_ERROR: ', '');
                console.warn('Detected HTTP error from server:', httpError);
                this.showError(`Server error: ${httpError}`);
            } else if (error.message.startsWith('JSON_PARSE_ERROR:')) {
                // JSON parsing failed - server responded but with invalid JSON
                const jsonError = error.message.replace('JSON_PARSE_ERROR: ', '');
                console.warn('Detected JSON parsing error:', jsonError);
                this.showError(`Server response parsing failed: ${jsonError}`);
            } else if (error.message.includes('Invalid response format')) {
                console.warn('Server returned unexpected data format');
                this.showError('Server returned invalid data format. Please check server logs.');
            } else {
                console.warn('Unknown error type:', error);
                this.showError(`Unexpected error: ${error.message}`);
            }
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show, version = 'both') {
        const loadingElement = document.getElementById('loading');
        const compareBtn = document.getElementById('compareBtn');

        if (!loadingElement || !compareBtn) {
            console.error('Required elements not found for showLoading');
            return;
        }

        compareBtn.disabled = show;

        if (show) {
            // Update loading message based on selected version
            let message;
            switch (version) {
                case 'v5':
                    message = 'Calling V5 (SOAP) API...';
                    break;
                case 'v6':
                    message = 'Calling V6 (REST) API...';
                    break;
                case 'both':
                default:
                    message = 'Calling both V5 and V6 APIs in parallel...';
                    break;
            }

            const messageElement = loadingElement.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            loadingElement.style.display = 'block';
            console.log('Loading shown:', message);
        } else {
            loadingElement.style.display = 'none';
            console.log('Loading hidden');
        }
    }

    hideResults() {
        document.getElementById('results').style.display = 'none';
    }

    clearError() {
        // Clear any existing error messages from the results area
        const comparison = document.querySelector('.comparison-grid');

        if (comparison) {
            // Only remove error messages, but preserve any actual result content
            const errorMessages = comparison.querySelectorAll('.error-message');
            errorMessages.forEach(error => {
                // Remove the error message and its parent container if it spans full width
                const parent = error.closest('div[style*="grid-column: 1 / -1"]');
                if (parent) {
                    parent.remove();
                } else {
                    error.remove();
                }
            });

            console.log('Error messages cleared, keeping any existing results');
        } else {
            console.log('No comparison grid found to clear errors from');
        }
    }

    displayResults(comparison) {
        console.log('displayResults called with:', comparison);
        const resultsSection = document.getElementById('results');
        const metadata = document.getElementById('metadata');
        const comparisonGrid = document.querySelector('.comparison-grid');

        // Check if required elements exist
        if (!resultsSection) {
            console.error('Results section not found');
            return;
        }

        console.log('Showing results section and clearing previous content');
        // Show results section
        resultsSection.style.display = 'block';
        console.log('✅ Results section display set to block');

        // Display metadata
        if (metadata && comparison.metadata) {
            console.log('Displaying metadata:', comparison.metadata);
            const versionInfo = comparison.metadata.version ? ` (${comparison.metadata.version.toUpperCase()})` : '';
            metadata.innerHTML = `
                <div class="metadata-item">
                    <i class="fas fa-clock"></i>
                    <span>Total Time: ${comparison.metadata.totalTime}</span>
                </div>
                <div class="metadata-item">
                    <i class="fas fa-calendar"></i>
                    <span>Timestamp: ${new Date(comparison.metadata.timestamp).toLocaleString()}</span>
                </div>
                <div class="metadata-item">
                    <i class="fas fa-code"></i>
                    <span>API: ${comparison.metadata.apiEndpoint}${versionInfo}</span>
                </div>
            `;
        } else {
            console.warn('Metadata element or comparison.metadata not found');
        }

        // Adjust grid layout based on what APIs were called
        const hasV5 = comparison.v5 !== undefined;
        const hasV6 = comparison.v6 !== undefined;

        if (comparisonGrid) {
            if (hasV5 && hasV6) {
                // Both APIs - show 2 columns
                comparisonGrid.style.gridTemplateColumns = '1fr 1fr';
                comparisonGrid.style.maxWidth = 'none';
                comparisonGrid.style.margin = '0';
            } else {
                // Single API - show 1 column using more space
                comparisonGrid.style.gridTemplateColumns = '1fr';
                comparisonGrid.style.maxWidth = '80%';
                comparisonGrid.style.margin = '0 auto';
            }
        }

        // Display results based on what's available
        console.log('About to display results. V5:', hasV5, 'V6:', hasV6);

        // Hide both initially
        document.querySelector('.api-result.v5').style.display = 'none';
        document.querySelector('.api-result.v6').style.display = 'none';

        if (hasV5) {
            this.displayApiResult('v5', comparison.v5);
        }

        if (hasV6) {
            this.displayApiResult('v6', comparison.v6);
        }
    }

    displayApiResult(version, result) {
        console.log(`displayApiResult called for ${version} with:`, result);

        document.querySelector(`.api-result.${version}`).style.display = '';

        const statusElement = document.getElementById(`${version}Status`);
        const resultElement = document.getElementById(`${version}Result`);

        // Check if elements exist before trying to set innerHTML
        if (!statusElement || !resultElement) {
            console.error(`DOM elements for ${version} not found. StatusElement:`, statusElement, 'ResultElement:', resultElement);
            return;
        }

        console.log(`Found DOM elements for ${version}, proceeding to display result`);

        // Display status
        const isSuccess = result.status === 'fulfilled';
        console.log(`${version} status: ${result.status}, isSuccess: ${isSuccess}`);
        statusElement.innerHTML = `
            <span class="status-badge ${isSuccess ? 'status-success' : 'status-error'}">
                ${isSuccess ? 'SUCCESS' : 'ERROR'}
            </span>
        `;
        console.log(`${version} status element updated`);

        // Display result content
        if (isSuccess && result.data !== null && result.data !== undefined) {
            console.log(`${version} has success data:`, result.data);
            // Handle both array and object responses
            let displayData = result.data;
            if (Array.isArray(result.data) && result.data.length === 0) {
                displayData = { message: "No data found", count: 0, results: [] };
            }

            resultElement.innerHTML = `
                <div class="json-display">
                    <pre><code class="language-json">${JSON.stringify(displayData, null, 2)}</code></pre>
                </div>
            `;
            console.log(`${version} success content updated in DOM`);
        } else if (result.error) {
            console.log(`${version} has error:`, result.error);
            // Try to parse and display detailed error information
            let errorDisplay = result.error;
            try {
                // Check if error is a JSON string
                if (typeof result.error === 'string' && result.error.includes('{')) {
                    const parsedError = JSON.parse(result.error);
                    errorDisplay = parsedError;
                }
            } catch (e) {
                // Keep original error if parsing fails
            }

            resultElement.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Error Details:</strong>
                    <div class="json-display" style="margin-top: 10px;">
                        <pre><code class="language-json">${JSON.stringify(errorDisplay, null, 2)}</code></pre>
                    </div>
                </div>
            `;
            console.log(`${version} error content updated in DOM`);
        } else {
            console.log(`${version} has no data or error, showing empty state`);
            resultElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <p>No data returned from ${version.toUpperCase()} API</p>
                    <small>The API call completed but returned no data</small>
                </div>
            `;
            console.log(`${version} empty state content updated in DOM`);
        }

        console.log(`${version} displayApiResult completed`);

        // Trigger syntax highlighting
        if (window.Prism) {
            setTimeout(() => {
                console.log(`Triggering Prism highlighting for ${version}`);
                Prism.highlightAll();
            }, 100);
        }
    }

    showError(message) {
        const resultsSection = document.getElementById('results');
        const comparison = document.querySelector('.comparison-grid');

        if (!resultsSection || !comparison) {
            console.error('Required DOM elements not found for error display');
            // Fallback: show alert
            alert(`Error: ${message}`);
            return;
        }

        // Create a new div below the comparison grid instead of replacing its content
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'grid-column: 1 / -1;';
        errorDiv.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Error:</strong> ${message}
                </div>
        `;
        comparison.appendChild(errorDiv);
        document.querySelector('.api-result.v5').style.display = 'none';
        document.querySelector('.api-result.v6').style.display = 'none';

        resultsSection.style.display = 'block';
    }
}

// Initialize the tester when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM Content Loaded - Initializing MindBodyAPITester');
    try {
        const tester = new MindBodyAPITester();
        console.log('✅ MindBodyAPITester initialized successfully');

        // Test button access
        const compareBtn = document.getElementById('compareBtn');
        if (compareBtn) {
            console.log('✅ Compare button found');
        } else {
            console.error('❌ Compare button not found');
        }

        // Test loading element access
        const loading = document.getElementById('loading');
        if (loading) {
            console.log('✅ Loading element found');
        } else {
            console.error('❌ Loading element not found');
        }

        // Test results element access  
        const results = document.getElementById('results');
        if (results) {
            console.log('✅ Results element found');
        } else {
            console.error('❌ Results element not found');
        }

    } catch (error) {
        console.error('❌ Failed to initialize MindBodyAPITester:', error);
    }
});
