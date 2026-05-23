import { useEffect, useState, useRef } from 'react';
import { FiGlobe, FiServer, FiGithub, FiDatabase, FiEdit2, FiTrash2, FiPlus, FiLock, FiKey, FiFileText, FiMonitor, FiShield, FiCalendar, FiUser, FiMail, FiLink, FiSettings, FiCode, FiCheckCircle, FiAlertCircle, FiCopy, FiUpload, FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import './Static.css';
import { staticAPI } from '../../../utils/staticAPI';
import { syncContactsFromForm } from '../../../utils/contactSyncUtil';
import { syncCustomerSupportFromForm } from '../../../utils/customerSupportSyncUtil';
import { syncBillScheduleFromForm } from '../../../utils/billScheduleSyncUtil';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const defaultWebsiteEntry = {
  // Basic Information
  projectName: '',
  purpose: '',
  projectType: 'business',
  customProjectTypeOther: '',

  // Domain Information
  domain: {
    domainName: '',
    registrar: '',
    renewalDate: '',
    serviceProvider: '',
    adminId: '',
    adminPassword: '',
    nameservers: [],
    sslStatus: 'active',
    sslExpiry: ''
  },

  // Admin Section
  admin: {
    adminUrl: '',
    adminId: '',
    adminPassword: '',
    twoFactorEnabled: false,
    backupCodes: '',
    recoveryEmail: ''
  },

  // Hosting Server Section
  hosting: {
    serverHosting: 'shared',
    serverType: '',
    renewalDate: '',
    serviceProvider: '',
    userId: '',
    password: '',
    controlPanel: '',
    ftpHost: '',
    ftpUsername: '',
    ftpPassword: '',
    sshAccess: false,
    sshKey: '',
    ipAddresses: [],
    serverLocation: ''
  },

  // GitHub Details
  github: {
    repoName: '',
    repoUrl: '',
    accessToken: '',
    deploymentBranch: 'main',
    ciCdEnabled: false,
    collaborators: [],
    repoVisibility: 'private'
  },

  // Database
  database: {
    type: 'mongodb',
    host: '',
    port: '',
    databaseName: '',
    username: '',
    password: '',
    connectionUrl: '',
    backupEnabled: true,
    backupFrequency: 'daily',
    lastBackupDate: ''
  },

  // Technology Stack
  technology: {
    frontend: [],
    backend: [],
    frameworks: [],
    libraries: [],
    apis: [],
    versionControl: 'git',
    packageManager: 'npm'
  },

  // Project Documentation
  documentation: {
    projectDocs: '',
    apiDocs: '',
    userManual: '',
    deploymentGuide: '',
    architectureDiagrams: '',
    changeLog: ''
  },

  // Environment & Configuration
  environment: {
    envFile: '',
    stagingUrl: '',
    productionUrl: '',
    testingUrl: '',
    developmentNotes: ''
  },

  // Landing Pages & Frontend
  frontend: {
    landingPages: [],
    components: [],
    themes: [],
    assets: [],
    buildTools: [],
    bundler: 'webpack'
  },

  // Backend Services
  backend: {
    apis: [],
    services: [],
    middleware: [],
    authentication: 'jwt',
    rateLimiting: true,
    corsEnabled: true
  },

  // Security & Monitoring
  security: {
    sslCertificate: true,
    firewallEnabled: true,
    monitoringEnabled: true,
    analytics: '',
    errorTracking: '',
    uptimeMonitoring: '',
    securityHeaders: true
  },

  // Maintenance & Support
  maintenance: {
    lastUpdateDate: '',
    nextScheduledMaintenance: '',
    supportContact: '',
    emergencyContact: '',
    maintenanceWindow: '',
    downtimeHistory: []
  },

  // Development Information
  development: {
    developerName: '',
    developmentCost: '',
    developmentDuration: '',
    developmentDurationUnit: 'months',
    totalMonths: ''
  },

  // Monitoring Information
  monitoring: {
    monitoringProvider: '',
    monitoringCost: '',
    monitoringDuration: '',
    monitoringDurationUnit: 'months',
    totalMonths: ''
  },

  // Additional Notes
  notes: '',
  tags: [],
  status: 'active',
  priority: 'medium'
};

const DigitalAssets = () => {
  const [websites, setWebsites] = useState([]);
  const [formData, setFormData] = useState(defaultWebsiteEntry);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [projectTypes, setProjectTypes] = useState(['business', 'portfolio', 'blog', 'ecommerce', 'saas', 'education', 'healthcare', 'other']);
  const [customProjectType, setCustomProjectType] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const serverTypes = ['shared', 'vps', 'dedicated', 'cloud', 'serverless'];
  const databaseTypes = ['mongodb', 'mysql', 'postgresql', 'sqlite', 'firebase', 'supabase'];
  const frontendFrameworks = ['react', 'vue', 'angular', 'svelte', 'nextjs', 'gatsby', 'vanilla'];
  const backendFrameworks = ['nodejs', 'express', 'django', 'flask', 'laravel', 'spring', 'rails'];
  const statuses = ['active', 'inactive', 'maintenance', 'development', 'archived'];
  const priorities = ['low', 'medium', 'high', 'critical'];

  useEffect(() => {
    trackFeatureUsage('/family/static/digital-assets', 'view');
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await staticAPI.getDigitalAssets();
      console.log('Fetched websites from backend:', response.data);
      setWebsites(response.data || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
      // Set empty array to show creative empty state
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultWebsiteEntry);
    setEditingId(null);
    setShowForm(false);
    setActiveSection('basic');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.projectName.trim()) {
      alert('Project Name is required');
      return;
    }

    // Validate custom project type when "other" is selected
    if (formData.projectType === 'other' && !formData.customProjectTypeOther.trim()) {
      alert('Please enter a custom project type');
      return;
    }

    try {
      setLoading(true);

      console.log('Submitting form data:', formData);

      if (editingId) {
        await staticAPI.updateDigitalAsset(editingId, formData);
        // Refresh data from backend
        await fetchWebsites();
        showSuccessPopupFn('Website updated successfully!');
      } else {
        console.log('Creating new website with data:', formData);
        const response = await staticAPI.createDigitalAsset(formData);
        console.log('Backend response:', response);
        // Refresh data from backend to ensure persistence
        await fetchWebsites();
        showSuccessPopupFn('Website added successfully!');
      }

      // Sync to other modules
      await Promise.all([
        syncContactsFromForm(formData, 'DigitalAssets'),
        syncCustomerSupportFromForm(formData, 'DigitalAssets'),
        syncBillScheduleFromForm(formData, 'DigitalAssets')
      ]);

      resetForm();
    } catch (error) {
      console.error('Error saving website:', error);
      alert('Failed to save website record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (website) => {
    setFormData(website);
    setEditingId(website._id);
    setShowForm(true);
    setEditMode(true);
  };

  const handleDelete = async (websiteId) => {
    if (window.confirm('Are you sure you want to delete this website record?')) {
      try {
        await staticAPI.deleteDigitalAsset(websiteId);
        setWebsites(prev => prev.filter(website => website._id !== websiteId));
      } catch (error) {
        console.error('Error deleting website:', error);
        alert('Failed to delete website record. Please try again.');
      }
    }
  };

  const boolVal = (v) => v === 'Yes' || v === 'Enabled' || v === true || v === 'true';
  const arrVal = (v) => v ? String(v).split(',').map(s => s.trim()).filter(Boolean) : [];

  const columnMapping = [
    { header: 'Project Name', path: 'projectName', required: true },
    { header: 'Purpose', path: 'purpose' },
    { header: 'Project Type', path: 'projectType' },
    { header: 'Custom Project Type', path: 'customProjectTypeOther' },

    { header: 'Domain Name', section: 'domain', field: 'domainName' },
    { header: 'Domain Registrar', section: 'domain', field: 'registrar' },
    { header: 'Domain Renewal Date', section: 'domain', field: 'renewalDate' },
    { header: 'Domain Service Provider', section: 'domain', field: 'serviceProvider' },
    { header: 'Domain Admin ID', section: 'domain', field: 'adminId' },
    { header: 'Domain Admin Password', section: 'domain', field: 'adminPassword' },
    { header: 'Domain Nameservers', section: 'domain', field: 'nameservers', type: 'array' },
    { header: 'Domain SSL Status', section: 'domain', field: 'sslStatus' },
    { header: 'Domain SSL Expiry', section: 'domain', field: 'sslExpiry' },

    { header: 'Admin URL', section: 'admin', field: 'adminUrl' },
    { header: 'Admin ID', section: 'admin', field: 'adminId' },
    { header: 'Admin Password', section: 'admin', field: 'adminPassword' },
    { header: 'Admin 2FA', section: 'admin', field: 'twoFactorEnabled', type: 'boolean' },
    { header: 'Admin Backup Codes', section: 'admin', field: 'backupCodes' },
    { header: 'Admin Recovery Email', section: 'admin', field: 'recoveryEmail' },

    { header: 'Hosting Type', section: 'hosting', field: 'serverHosting' },
    { header: 'Hosting Server Type', section: 'hosting', field: 'serverType' },
    { header: 'Hosting Renewal Date', section: 'hosting', field: 'renewalDate' },
    { header: 'Hosting Provider', section: 'hosting', field: 'serviceProvider' },
    { header: 'Hosting User ID', section: 'hosting', field: 'userId' },
    { header: 'Hosting Password', section: 'hosting', field: 'password' },
    { header: 'Hosting Control Panel', section: 'hosting', field: 'controlPanel' },
    { header: 'Hosting FTP Host', section: 'hosting', field: 'ftpHost' },
    { header: 'Hosting FTP Username', section: 'hosting', field: 'ftpUsername' },
    { header: 'Hosting FTP Password', section: 'hosting', field: 'ftpPassword' },
    { header: 'Hosting SSH Access', section: 'hosting', field: 'sshAccess', type: 'boolean' },
    { header: 'Hosting SSH Key', section: 'hosting', field: 'sshKey' },
    { header: 'Hosting IP Addresses', section: 'hosting', field: 'ipAddresses', type: 'array' },
    { header: 'Hosting Location', section: 'hosting', field: 'serverLocation' },

    { header: 'GitHub Repo Name', section: 'github', field: 'repoName' },
    { header: 'GitHub Repo URL', section: 'github', field: 'repoUrl' },
    { header: 'GitHub Access Token', section: 'github', field: 'accessToken' },
    { header: 'GitHub Branch', section: 'github', field: 'deploymentBranch' },
    { header: 'GitHub CI/CD', section: 'github', field: 'ciCdEnabled', type: 'boolean' },
    { header: 'GitHub Collaborators', section: 'github', field: 'collaborators', type: 'array' },
    { header: 'GitHub Visibility', section: 'github', field: 'repoVisibility' },

    { header: 'Database Type', section: 'database', field: 'type' },
    { header: 'Database Host', section: 'database', field: 'host' },
    { header: 'Database Port', section: 'database', field: 'port' },
    { header: 'Database Name', section: 'database', field: 'databaseName' },
    { header: 'Database Username', section: 'database', field: 'username' },
    { header: 'Database Password', section: 'database', field: 'password' },
    { header: 'Connection URL', section: 'database', field: 'connectionUrl' },
    { header: 'Database Backup', section: 'database', field: 'backupEnabled', type: 'boolean' },
    { header: 'Database Backup Frequency', section: 'database', field: 'backupFrequency' },
    { header: 'Database Last Backup', section: 'database', field: 'lastBackupDate' },

    { header: 'Tech Frontend', section: 'technology', field: 'frontend', type: 'array' },
    { header: 'Tech Backend', section: 'technology', field: 'backend', type: 'array' },
    { header: 'Tech Frameworks', section: 'technology', field: 'frameworks', type: 'array' },
    { header: 'Tech Libraries', section: 'technology', field: 'libraries', type: 'array' },
    { header: 'Tech APIs', section: 'technology', field: 'apis', type: 'array' },
    { header: 'Tech Version Control', section: 'technology', field: 'versionControl' },
    { header: 'Tech Package Manager', section: 'technology', field: 'packageManager' },

    { header: 'Docs - Project Docs', section: 'documentation', field: 'projectDocs' },
    { header: 'Docs - API Docs', section: 'documentation', field: 'apiDocs' },
    { header: 'Docs - User Manual', section: 'documentation', field: 'userManual' },
    { header: 'Docs - Deployment Guide', section: 'documentation', field: 'deploymentGuide' },
    { header: 'Docs - Architecture Diagrams', section: 'documentation', field: 'architectureDiagrams' },
    { header: 'Docs - Change Log', section: 'documentation', field: 'changeLog' },

    { header: 'Env File', section: 'environment', field: 'envFile' },
    { header: 'Staging URL', section: 'environment', field: 'stagingUrl' },
    { header: 'Production URL', section: 'environment', field: 'productionUrl' },
    { header: 'Testing URL', section: 'environment', field: 'testingUrl' },
    { header: 'Dev Notes', section: 'environment', field: 'developmentNotes' },

    { header: 'FE Landing Pages', section: 'frontend', field: 'landingPages', type: 'array' },
    { header: 'FE Components', section: 'frontend', field: 'components', type: 'array' },
    { header: 'FE Themes', section: 'frontend', field: 'themes', type: 'array' },
    { header: 'FE Assets', section: 'frontend', field: 'assets', type: 'array' },
    { header: 'FE Build Tools', section: 'frontend', field: 'buildTools', type: 'array' },
    { header: 'FE Bundler', section: 'frontend', field: 'bundler' },

    { header: 'BE APIs', section: 'backend', field: 'apis', type: 'array' },
    { header: 'BE Services', section: 'backend', field: 'services', type: 'array' },
    { header: 'BE Middleware', section: 'backend', field: 'middleware', type: 'array' },
    { header: 'BE Authentication', section: 'backend', field: 'authentication' },
    { header: 'BE Rate Limiting', section: 'backend', field: 'rateLimiting', type: 'boolean' },
    { header: 'BE CORS', section: 'backend', field: 'corsEnabled', type: 'boolean' },

    { header: 'Sec SSL Certificate', section: 'security', field: 'sslCertificate', type: 'boolean' },
    { header: 'Sec Firewall', section: 'security', field: 'firewallEnabled', type: 'boolean' },
    { header: 'Sec Monitoring', section: 'security', field: 'monitoringEnabled', type: 'boolean' },
    { header: 'Sec Analytics', section: 'security', field: 'analytics' },
    { header: 'Sec Error Tracking', section: 'security', field: 'errorTracking' },
    { header: 'Sec Uptime Monitoring', section: 'security', field: 'uptimeMonitoring' },
    { header: 'Sec Headers', section: 'security', field: 'securityHeaders', type: 'boolean' },

    { header: 'Maint Last Update', section: 'maintenance', field: 'lastUpdateDate' },
    { header: 'Maint Next Scheduled', section: 'maintenance', field: 'nextScheduledMaintenance' },
    { header: 'Maint Support Contact', section: 'maintenance', field: 'supportContact' },
    { header: 'Maint Emergency Contact', section: 'maintenance', field: 'emergencyContact' },
    { header: 'Maint Window', section: 'maintenance', field: 'maintenanceWindow' },
    { header: 'Maint Downtime History', section: 'maintenance', field: 'downtimeHistory', type: 'array' },

    { header: 'Dev Name', section: 'development', field: 'developerName' },
    { header: 'Dev Cost', section: 'development', field: 'developmentCost' },
    { header: 'Dev Duration', section: 'development', field: 'developmentDuration' },
    { header: 'Dev Duration Unit', section: 'development', field: 'developmentDurationUnit' },
    { header: 'Dev Total Months', section: 'development', field: 'totalMonths' },

    { header: 'Mon Provider', section: 'monitoring', field: 'monitoringProvider' },
    { header: 'Mon Cost', section: 'monitoring', field: 'monitoringCost' },
    { header: 'Mon Duration', section: 'monitoring', field: 'monitoringDuration' },
    { header: 'Mon Duration Unit', section: 'monitoring', field: 'monitoringDurationUnit' },
    { header: 'Mon Total Months', section: 'monitoring', field: 'totalMonths' },

    { header: 'Tags', path: 'tags', type: 'array' },
    { header: 'Notes', path: 'notes' },
    { header: 'Status', path: 'status' },
    { header: 'Priority', path: 'priority' },
  ];

  const getValue = (row, key) => {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '').trim();
    const actualKey = Object.keys(row).find(k =>
      k.toLowerCase().replace(/\s+/g, '').trim() === normalizedKey
    );
    return actualKey ? row[actualKey] : undefined;
  };

  const buildRecordFromRow = (row) => {
    const record = {
      domain: {}, admin: {}, hosting: {}, github: {}, database: {},
      technology: {}, documentation: {}, environment: {}, frontend: {},
      backend: {}, security: {}, maintenance: {}, development: {}, monitoring: {},
      tags: [], status: 'active', priority: 'medium'
    };
    for (const col of columnMapping) {
      let val = getValue(row, col.header);
      if (val === undefined || val === '') continue;
      if (col.type === 'boolean') {
        val = boolVal(val);
      } else if (col.type === 'array') {
        val = arrVal(val);
      } else {
        val = String(val);
      }
      if (col.section) {
        record[col.section][col.field] = val;
      } else {
        record[col.path] = val;
      }
    }
    return record;
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('Excel file is empty!');
        setUploading(false);
        return;
      }

      const firstRow = jsonData[0];
      const missing = columnMapping
        .filter(col => col.required)
        .filter(col => !(col.header in firstRow));
      if (missing.length > 0) {
        alert(`Missing required columns: ${missing.map(c => c.header).join(', ')}`);
        setUploading(false);
        return;
      }

      const records = jsonData.map(row => buildRecordFromRow(row));

      const res = await staticAPI.bulkCreateDigitalAssets({ records });

      const syncPromises = [];
      for (const record of records) {
        syncPromises.push(
          syncContactsFromForm(record, 'DigitalAssets'),
          syncCustomerSupportFromForm(record, 'DigitalAssets'),
          syncBillScheduleFromForm(record, 'DigitalAssets')
        );
      }
      await Promise.allSettled(syncPromises);

      await fetchWebsites();
      alert(`Import completed!\nSuccess: ${res.data.created}\nErrors: ${res.data.errors?.length || 0}`);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      alert('Error processing Excel file. Please check the format.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Project Name': 'Tech Solutions Website',
        'Purpose': 'Company website and blog',
        'Project Type': 'business',
        'Custom Project Type': '',
        'Domain Name': 'techsolutions.com',
        'Domain Registrar': 'GoDaddy',
        'Domain Renewal Date': '2026-12-31',
        'Domain Service Provider': 'Cloudflare',
        'Domain Admin ID': 'admin@techsolutions.com',
        'Domain Admin Password': '',
        'Domain Nameservers': 'ns1.cloudflare.com, ns2.cloudflare.com',
        'Domain SSL Status': 'active',
        'Domain SSL Expiry': '2027-01-31',
        'Admin URL': 'https://techsolutions.com/admin',
        'Admin ID': 'admin@techsolutions.com',
        'Admin Password': '',
        'Admin 2FA': 'Yes',
        'Admin Backup Codes': 'ABCD-1234, WXYZ-5678',
        'Admin Recovery Email': 'owner@gmail.com',
        'Hosting Type': 'cloud',
        'Hosting Server Type': 'Nginx',
        'Hosting Renewal Date': '2026-06-30',
        'Hosting Provider': 'AWS',
        'Hosting User ID': 'ubuntu',
        'Hosting Password': '',
        'Hosting Control Panel': 'Custom',
        'Hosting FTP Host': 'ftp.techsolutions.com',
        'Hosting FTP Username': 'ftpuser',
        'Hosting FTP Password': '',
        'Hosting SSH Access': 'Yes',
        'Hosting SSH Key': 'ssh-rsa AAAAB3...',
        'Hosting IP Addresses': '192.168.1.1, 10.0.0.1',
        'Hosting Location': 'Mumbai',
        'GitHub Repo Name': 'techsolutions/website',
        'GitHub Repo URL': 'https://github.com/techsolutions/website',
        'GitHub Access Token': '',
        'GitHub Branch': 'main',
        'GitHub CI/CD': 'Yes',
        'GitHub Collaborators': 'dev1, dev2',
        'GitHub Visibility': 'private',
        'Database Type': 'mongodb',
        'Database Host': 'localhost',
        'Database Port': '27017',
        'Database Name': 'techsolutions',
        'Database Username': 'dbadmin',
        'Database Password': '',
        'Connection URL': 'mongodb://localhost:27017/techsolutions',
        'Database Backup': 'Yes',
        'Database Backup Frequency': 'daily',
        'Database Last Backup': '2026-05-22',
        'Tech Frontend': 'React, Next.js',
        'Tech Backend': 'Node.js, Express',
        'Tech Frameworks': 'Tailwind, Material UI',
        'Tech Libraries': 'Axios, Lodash',
        'Tech APIs': 'REST, GraphQL',
        'Tech Version Control': 'git',
        'Tech Package Manager': 'npm',
        'Docs - Project Docs': 'https://docs.techsolutions.com',
        'Docs - API Docs': 'https://api.techsolutions.com/docs',
        'Docs - User Manual': '',
        'Docs - Deployment Guide': 'Deploy using Docker on ECS',
        'Docs - Architecture Diagrams': '',
        'Docs - Change Log': 'v2.0 - Major UI overhaul',
        'Env File': '.env.production',
        'Staging URL': 'https://staging.techsolutions.com',
        'Production URL': 'https://techsolutions.com',
        'Testing URL': 'https://testing.techsolutions.com',
        'Dev Notes': 'Use Node 18+',
        'FE Landing Pages': 'Home, About, Contact',
        'FE Components': 'Header, Footer, Sidebar',
        'FE Themes': 'Light, Dark',
        'FE Assets': 'logo.svg, fonts',
        'FE Build Tools': 'Webpack, Vite',
        'FE Bundler': 'webpack',
        'BE APIs': '/api/users, /api/auth',
        'BE Services': 'Auth, Payment, Email',
        'BE Middleware': 'Auth, Logger, Rate Limiter',
        'BE Authentication': 'JWT',
        'BE Rate Limiting': 'Yes',
        'BE CORS': 'Yes',
        'Sec SSL Certificate': 'Yes',
        'Sec Firewall': 'Yes',
        'Sec Monitoring': 'Yes',
        'Sec Analytics': 'Google Analytics',
        'Sec Error Tracking': 'Sentry',
        'Sec Uptime Monitoring': 'Pingdom',
        'Sec Headers': 'Yes',
        'Maint Last Update': '2026-05-01',
        'Maint Next Scheduled': '2026-06-01',
        'Maint Support Contact': 'support@techsolutions.com',
        'Maint Emergency Contact': '+91-9876543210',
        'Maint Window': 'Sunday 2-4 AM',
        'Maint Downtime History': '2026-04-15, 2026-05-10',
        'Dev Name': 'Rahul Sharma',
        'Dev Cost': '500000',
        'Dev Duration': '6',
        'Dev Duration Unit': 'months',
        'Dev Total Months': '6',
        'Mon Provider': 'Datadog',
        'Mon Cost': '5000',
        'Mon Duration': '12',
        'Mon Duration Unit': 'months',
        'Mon Total Months': '12',
        'Tags': 'production, main-website',
        'Notes': 'Production server with auto-scaling',
        'Status': 'active',
        'Priority': 'high',
      },
      {
        'Project Name': 'Portfolio Site',
        'Purpose': 'Personal portfolio',
        'Project Type': 'portfolio',
        'Custom Project Type': '',
        'Domain Name': 'johndoe.dev',
        'Domain Registrar': 'Namecheap',
        'Domain Renewal Date': '2026-11-15',
        'Domain Service Provider': 'Namecheap',
        'Domain Admin ID': 'admin@johndoe.dev',
        'Domain Admin Password': '',
        'Domain Nameservers': 'dns1.namecheap.com',
        'Domain SSL Status': 'active',
        'Domain SSL Expiry': '2026-12-15',
        'Admin URL': 'https://johndoe.dev/admin',
        'Admin ID': 'admin@johndoe.dev',
        'Admin Password': '',
        'Admin 2FA': 'No',
        'Admin Backup Codes': '',
        'Admin Recovery Email': 'john@gmail.com',
        'Hosting Type': 'shared',
        'Hosting Server Type': 'Apache',
        'Hosting Renewal Date': '2026-08-20',
        'Hosting Provider': 'Hostinger',
        'Hosting User ID': 'johndoe',
        'Hosting Password': '',
        'Hosting Control Panel': 'cPanel',
        'Hosting FTP Host': 'ftp.johndoe.dev',
        'Hosting FTP Username': 'johndoe_ftp',
        'Hosting FTP Password': '',
        'Hosting SSH Access': 'No',
        'Hosting SSH Key': '',
        'Hosting IP Addresses': '',
        'Hosting Location': 'Singapore',
        'GitHub Repo Name': 'johndoe/portfolio',
        'GitHub Repo URL': 'https://github.com/johndoe/portfolio',
        'GitHub Access Token': '',
        'GitHub Branch': 'main',
        'GitHub CI/CD': 'No',
        'GitHub Collaborators': '',
        'GitHub Visibility': 'public',
        'Database Type': '',
        'Database Host': '',
        'Database Port': '',
        'Database Name': '',
        'Database Username': '',
        'Database Password': '',
        'Connection URL': '',
        'Database Backup': '',
        'Database Backup Frequency': '',
        'Database Last Backup': '',
        'Tech Frontend': 'React',
        'Tech Backend': '',
        'Tech Frameworks': 'Tailwind',
        'Tech Libraries': '',
        'Tech APIs': '',
        'Tech Version Control': 'git',
        'Tech Package Manager': 'npm',
        'Docs - Project Docs': '',
        'Docs - API Docs': '',
        'Docs - User Manual': '',
        'Docs - Deployment Guide': 'Deploy via Vercel',
        'Docs - Architecture Diagrams': '',
        'Docs - Change Log': '',
        'Env File': '.env',
        'Staging URL': '',
        'Production URL': 'https://johndoe.dev',
        'Testing URL': '',
        'Dev Notes': '',
        'FE Landing Pages': 'Home, Projects',
        'FE Components': 'Navbar, Footer',
        'FE Themes': 'Dark',
        'FE Assets': '',
        'FE Build Tools': 'Vite',
        'FE Bundler': 'vite',
        'BE APIs': '',
        'BE Services': '',
        'BE Middleware': '',
        'BE Authentication': '',
        'BE Rate Limiting': '',
        'BE CORS': '',
        'Sec SSL Certificate': 'Yes',
        'Sec Firewall': 'No',
        'Sec Monitoring': 'No',
        'Sec Analytics': '',
        'Sec Error Tracking': '',
        'Sec Uptime Monitoring': '',
        'Sec Headers': 'Yes',
        'Maint Last Update': '',
        'Maint Next Scheduled': '',
        'Maint Support Contact': '',
        'Maint Emergency Contact': '',
        'Maint Window': '',
        'Maint Downtime History': '',
        'Dev Name': 'John Doe',
        'Dev Cost': '50000',
        'Dev Duration': '2',
        'Dev Duration Unit': 'months',
        'Dev Total Months': '2',
        'Mon Provider': '',
        'Mon Cost': '',
        'Mon Duration': '',
        'Mon Duration Unit': '',
        'Mon Total Months': '',
        'Tags': 'portfolio, personal',
        'Notes': 'Static site built with React',
        'Status': 'active',
        'Priority': 'medium',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Digital_Assets_Template.xlsx');
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addArrayItem = (section, field, item) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section]?.[field] || []), item]
      }
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section]?.[field]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const handleProjectTypeChange = (value) => {
    setCustomProjectType(value);
    handleInputChange(null, 'projectType', value);

    // Clear custom project type field if not selecting "other"
    if (value !== 'other') {
      handleInputChange(null, 'customProjectTypeOther', '');
    }

    // Add custom type to dropdown if it doesn't exist
    if (value && !projectTypes.includes(value.toLowerCase())) {
      setProjectTypes([...projectTypes, value.toLowerCase()]);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  // Helper function to get display name for project type
  const getProjectTypeDisplay = (website) => {
    if (website.projectType === 'other' && website.customProjectTypeOther) {
      return website.customProjectTypeOther;
    }
    return website.projectType ? website.projectType.charAt(0).toUpperCase() + website.projectType.slice(1) : 'N/A';
  };

  const showSuccessPopupFn = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  // Calculate completion percentage based on mandatory fields
  const calculateCompletionPercentage = (website) => {
    const mandatoryFields = [
      // Basic info
      website.projectName,
      website.projectType,
      website.status,
      website.priority,
      // Domain info
      website.domain?.domainName,
      website.domain?.registrar,
      website.domain?.renewalDate,
      website.domain?.serviceProvider,
      // Hosting info
      website.hosting?.serverHosting,
      website.hosting?.renewalDate,
      website.hosting?.serviceProvider,
      // Admin info
      website.admin?.adminUrl,
      website.admin?.adminId,
      website.admin?.recoveryEmail
    ];

    const filledFields = mandatoryFields.filter(field =>
      field !== undefined && field !== null && field !== ''
    ).length;

    return Math.round((filledFields / mandatoryFields.length) * 100);
  };

  const sections = [
    { id: 'basic', name: 'Basic Info', icon: FiGlobe },
    { id: 'domain', name: 'Domain', icon: FiGlobe },
    { id: 'admin', name: 'Admin', icon: FiUser },
    { id: 'hosting', name: 'Hosting', icon: FiServer },
    { id: 'github', name: 'GitHub', icon: FiGithub },
    { id: 'database', name: 'Database', icon: FiDatabase },
    { id: 'technology', name: 'Technology', icon: FiCode },
    { id: 'documentation', name: 'Documentation', icon: FiFileText },
    { id: 'environment', name: 'Environment', icon: FiSettings },
    { id: 'frontend', name: 'Frontend', icon: FiMonitor },
    { id: 'backend', name: 'Backend', icon: FiServer },
    { id: 'security', name: 'Security', icon: FiShield },
    { id: 'development', name: 'Development', icon: FiCode },
    { id: 'monitoring', name: 'Monitoring', icon: FiShield }
  ];

  // Icon mapping for easy access
  const iconMap = {
    basic: FiGlobe,
    domain: FiGlobe,
    admin: FiUser,
    hosting: FiServer,
    github: FiGithub,
    database: FiDatabase,
    technology: FiCode,
    documentation: FiFileText,
    environment: FiSettings,
    frontend: FiMonitor,
    backend: FiServer,
    security: FiShield,
    development: FiCode,
    monitoring: FiShield
  };

  if (loading && websites.length === 0) {
    return (
      <div className="static-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading website assets...</p>
      </div>
    );
  }

  return (
    <div className="static-page">
      <div className="static-header" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="header-content">
          <div className="header-icon">
            <FiGlobe />
          </div>
          <div className="header-text">
            <h1 style={{ color: '#0A0A0A' }}>Digital Assets - Website Management</h1>
            <p style={{ color: '#4A5568' }}>Manage all your websites, domains, and technical infrastructure</p>
          </div>
        </div>
        <div className="header-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelUpload}
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
          />
          {!showForm ? (
            <>
              <button
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <FiUpload /> {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Excel'}
              </button>
              <button className="btn-secondary" onClick={downloadTemplate}>
                <FiDownload /> Template
              </button>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <FiPlus /> Add Website
              </button>
            </>
          ) : (
            <div className="edit-actions">
              <button className="btn-success" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
              </button>
              <button className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="static-content">
        {!showForm ? (
          // Websites List View
          <div className="websites-list">
            {websites.length === 0 ? (
              <div className="empty-state-creative">
                <div className="empty-content">
                  <div className="empty-illustration">
                    <div className="globe-container">
                      <FiGlobe className="main-globe" />
                      <div className="orbit-orbit">
                        <FiServer className="orbit-item orbit-1" />
                        <FiDatabase className="orbit-item orbit-2" />
                        <FiGithub className="orbit-item orbit-3" />
                      </div>
                    </div>
                  </div>
                  <div className="empty-text">
                    <h2>Ready to Launch Your Digital Empire?</h2>
                    <p>Start managing your websites, domains, and technical infrastructure all in one place</p>
                    <div className="feature-highlights">
                      <div className="feature-item">
                        <FiGlobe />
                        <span>Domain Management</span>
                      </div>
                      <div className="feature-item">
                        <FiServer />
                        <span>Hosting Control</span>
                      </div>
                      <div className="feature-item">
                        <FiDatabase />
                        <span>Database Config</span>
                      </div>
                      <div className="feature-item">
                        <FiGithub />
                        <span>Git Integration</span>
                      </div>
                    </div>
                    <button className="btn-primary btn-large" onClick={() => setShowForm(true)}>
                      <FiPlus /> Add Your First Website
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="websites-table-container">
                <table className="websites-table">
                  <thead>
                    <tr>
                      <th>Domain Name</th>
                      <th>Domain Provider</th>
                      <th>Domain Renewal</th>
                      <th>Server Hosting</th>
                      <th>Service Provider</th>
                      <th>Hosting Renewal Dates</th>
                      <th>Completion %</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {websites.map(website => {
                      const completionPercentage = calculateCompletionPercentage(website);
                      return (
                        <tr key={website._id}>
                          <td>{website.domain?.domainName || 'N/A'}</td>
                          <td>{website.domain?.registrar || 'N/A'}</td>
                          <td>{website.domain?.renewalDate ? new Date(website.domain.renewalDate).toLocaleDateString() : 'N/A'}</td>
                          <td>{website.hosting?.serverHosting || 'N/A'}</td>
                          <td>{website.hosting?.serviceProvider || 'N/A'}</td>
                          <td>{website.hosting?.renewalDate ? new Date(website.hosting.renewalDate).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div className="completion-percentage">
                              <div className={`completion-bar ${completionPercentage === 100 ? 'complete' : completionPercentage >= 50 ? 'partial' : 'low'}`}>
                                <div
                                  className="completion-fill"
                                  style={{ width: `${completionPercentage}%` }}
                                ></div>
                              </div>
                              <span className="completion-text">{completionPercentage}%</span>
                            </div>
                          </td>
                          <td className="table-actions">
                            <button className="btn-edit" onClick={() => handleEdit(website)}>
                              <FiEdit2 />
                            </button>
                            <button className="btn-delete" onClick={() => handleDelete(website._id)}>
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // Website Form View
          <div className="website-form">
            {/* Section Navigation */}
            <div className="form-navigation">
              <div className="nav-tabs">
                {sections.map(section => (
                  <button
                    key={section.id}
                    className={`nav-tab ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {(() => {
                      const TabIcon = iconMap[section.id];
                      return TabIcon ? <TabIcon /> : <FiGlobe />;
                    })()}
                    {section.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Section Title Display */}
              <div className="current-section-title">
                <div className="section-title-icon">
                  {(() => {
                    const CurrentIcon = iconMap[activeSection];
                    return CurrentIcon ? <CurrentIcon /> : <FiGlobe />;
                  })()}
                </div>
                <h2>{sections.find(s => s.id === activeSection)?.name || 'Section'}</h2>
              </div>

              {/* Basic Information Section */}
              {activeSection === 'basic' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiGlobe className="section-icon" />
                    <h3>Basic Information</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Project Name</label>
                        <input
                          type="text"
                          value={formData.projectName}
                          onChange={(e) => handleInputChange(null, 'projectName', e.target.value)}
                          placeholder="e.g., Tech Solutions Website"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Project Type</label>
                        <select
                          value={formData.projectType}
                          onChange={(e) => handleProjectTypeChange(e.target.value)}
                          onInput={(e) => handleProjectTypeChange(e.target.value)}
                        >
                          <option value="">Select or type...</option>
                          {projectTypes.map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                          {customProjectType && !projectTypes.includes(customProjectType.toLowerCase()) && (
                            <option value={customProjectType}>
                              {customProjectType.charAt(0).toUpperCase() + customProjectType.slice(1)}
                            </option>
                          )}
                        </select>
                      </div>
                      {formData.projectType === 'other' && (
                        <div className="form-group">
                          <label>Custom Project Type</label>
                          <input
                            type="text"
                            value={formData.customProjectTypeOther}
                            onChange={(e) => handleInputChange(null, 'customProjectTypeOther', e.target.value)}
                            placeholder="Enter your custom project type"
                            required
                          />
                        </div>
                      )}
                      <div className="form-group full-width">
                        <label>Purpose</label>
                        <textarea
                          value={formData.purpose}
                          onChange={(e) => handleInputChange(null, 'purpose', e.target.value)}
                          placeholder="Describe the purpose and main functionality of this website"
                          rows={3}
                        />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => handleInputChange(null, 'status', e.target.value)}
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => handleInputChange(null, 'priority', e.target.value)}
                        >
                          {priorities.map(priority => (
                            <option key={priority} value={priority}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Domain Information Section */}
              {activeSection === 'domain' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiGlobe className="section-icon" />
                    <h3>Domain Information</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Domain Name</label>
                        <input
                          type="text"
                          value={formData.domain?.domainName || ''}
                          onChange={(e) => handleInputChange('domain', 'domainName', e.target.value)}
                          placeholder="example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Registrar</label>
                        <input
                          type="text"
                          value={formData.domain?.registrar || ''}
                          onChange={(e) => handleInputChange('domain', 'registrar', e.target.value)}
                          placeholder="GoDaddy, Namecheap, etc."
                        />
                      </div>
                      <div className="form-group">
                        <label>Renewal Date</label>
                        <input
                          type="date"
                          value={formData.domain?.renewalDate || ''}
                          onChange={(e) => handleInputChange('domain', 'renewalDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Service Provider</label>
                        <input
                          type="text"
                          value={formData.domain?.serviceProvider || ''}
                          onChange={(e) => handleInputChange('domain', 'serviceProvider', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Admin ID</label>
                        <input
                          type="text"
                          value={formData.domain?.adminId || ''}
                          onChange={(e) => handleInputChange('domain', 'adminId', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Admin Password</label>
                        <div className="password-input">
                          <input
                            type="password"
                            value={formData.domain?.adminPassword || ''}
                            onChange={(e) => handleInputChange('domain', 'adminPassword', e.target.value)}
                            placeholder="Enter password"
                          />
                          <button type="button" className="btn-icon" onClick={() => copyToClipboard(formData.domain?.adminPassword || '')}>
                            <FiCopy />
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>SSL Status</label>
                        <select
                          value={formData.domain?.sslStatus || 'active'}
                          onChange={(e) => handleInputChange('domain', 'sslStatus', e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>SSL Expiry</label>
                        <input
                          type="date"
                          value={formData.domain?.sslExpiry || ''}
                          onChange={(e) => handleInputChange('domain', 'sslExpiry', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Section */}
              {activeSection === 'admin' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiUser className="section-icon" />
                    <h3>Admin Section</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Admin URL</label>
                        <input
                          type="url"
                          value={formData.admin?.adminUrl || ''}
                          onChange={(e) => handleInputChange('admin', 'adminUrl', e.target.value)}
                          placeholder="https://example.com/admin"
                        />
                      </div>
                      <div className="form-group">
                        <label>Admin ID</label>
                        <input
                          type="text"
                          value={formData.admin?.adminId || ''}
                          onChange={(e) => handleInputChange('admin', 'adminId', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Admin Password</label>
                        <div className="password-input">
                          <input
                            type="password"
                            value={formData.admin?.adminPassword || ''}
                            onChange={(e) => handleInputChange('admin', 'adminPassword', e.target.value)}
                          />
                          <button type="button" className="btn-icon" onClick={() => copyToClipboard(formData.admin?.adminPassword || '')}>
                            <FiCopy />
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Recovery Email</label>
                        <input
                          type="email"
                          value={formData.admin?.recoveryEmail || ''}
                          onChange={(e) => handleInputChange('admin', 'recoveryEmail', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Two-Factor Authentication</label>
                        <select
                          value={formData.admin?.twoFactorEnabled ? 'enabled' : 'disabled'}
                          onChange={(e) => handleInputChange('admin', 'twoFactorEnabled', e.target.value === 'enabled')}
                        >
                          <option value="disabled">Disabled</option>
                          <option value="enabled">Enabled</option>
                        </select>
                      </div>
                      <div className="form-group full-width">
                        <label>Backup Codes</label>
                        <textarea
                          value={formData.admin?.backupCodes || ''}
                          onChange={(e) => handleInputChange('admin', 'backupCodes', e.target.value)}
                          placeholder="Store 2FA backup codes here (comma separated)"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hosting Server Section */}
              {activeSection === 'hosting' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiServer className="section-icon" />
                    <h3>Hosting Server</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Server Hosting</label>
                        <select
                          value={formData.hosting?.serverHosting || 'shared'}
                          onChange={(e) => handleInputChange('hosting', 'serverHosting', e.target.value)}
                        >
                          {serverTypes.map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Server Type</label>
                        <input
                          type="text"
                          value={formData.hosting?.serverType || ''}
                          onChange={(e) => handleInputChange('hosting', 'serverType', e.target.value)}
                          placeholder="e.g., Apache, Nginx, IIS"
                        />
                      </div>
                      <div className="form-group">
                        <label>Renewal Date</label>
                        <input
                          type="date"
                          value={formData.hosting?.renewalDate || ''}
                          onChange={(e) => handleInputChange('hosting', 'renewalDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Service Provider</label>
                        <input
                          type="text"
                          value={formData.hosting?.serviceProvider || ''}
                          onChange={(e) => handleInputChange('hosting', 'serviceProvider', e.target.value)}
                          placeholder="DigitalOcean, AWS, etc."
                        />
                      </div>
                      <div className="form-group">
                        <label>User ID</label>
                        <input
                          type="text"
                          value={formData.hosting?.userId || ''}
                          onChange={(e) => handleInputChange('hosting', 'userId', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <div className="password-input">
                          <input
                            type="password"
                            value={formData.hosting?.password || ''}
                            onChange={(e) => handleInputChange('hosting', 'password', e.target.value)}
                          />
                          <button type="button" className="btn-icon" onClick={() => copyToClipboard(formData.hosting?.password || '')}>
                            <FiCopy />
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Control Panel</label>
                        <input
                          type="text"
                          value={formData.hosting?.controlPanel || ''}
                          onChange={(e) => handleInputChange('hosting', 'controlPanel', e.target.value)}
                          placeholder="cPanel, Plesk, Custom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Server Location</label>
                        <input
                          type="text"
                          value={formData.hosting?.serverLocation || ''}
                          onChange={(e) => handleInputChange('hosting', 'serverLocation', e.target.value)}
                          placeholder="Mumbai, US East, etc."
                        />
                      </div>
                      <div className="form-group">
                        <label>SSH Access</label>
                        <select
                          value={formData.hosting?.sshAccess ? 'enabled' : 'disabled'}
                          onChange={(e) => handleInputChange('hosting', 'sshAccess', e.target.value === 'enabled')}
                        >
                          <option value="disabled">Disabled</option>
                          <option value="enabled">Enabled</option>
                        </select>
                      </div>
                      <div className="form-group full-width">
                        <label>SSH Key</label>
                        <textarea
                          value={formData.hosting?.sshKey || ''}
                          onChange={(e) => handleInputChange('hosting', 'sshKey', e.target.value)}
                          placeholder="Paste SSH private key here"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GitHub Details Section */}
              {activeSection === 'github' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiGithub className="section-icon" />
                    <h3>GitHub Details</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Repository Name</label>
                        <input
                          type="text"
                          value={formData.github?.repoName || ''}
                          onChange={(e) => handleInputChange('github', 'repoName', e.target.value)}
                          placeholder="username/repository"
                        />
                      </div>
                      <div className="form-group">
                        <label>Repository URL</label>
                        <input
                          type="url"
                          value={formData.github?.repoUrl || ''}
                          onChange={(e) => handleInputChange('github', 'repoUrl', e.target.value)}
                          placeholder="https://github.com/username/repository"
                        />
                      </div>
                      <div className="form-group">
                        <label>Deployment Branch</label>
                        <input
                          type="text"
                          value={formData.github?.deploymentBranch || ''}
                          onChange={(e) => handleInputChange('github', 'deploymentBranch', e.target.value)}
                          placeholder="main, master, develop"
                        />
                      </div>
                      <div className="form-group">
                        <label>Repository Visibility</label>
                        <select
                          value={formData.github?.repoVisibility || 'private'}
                          onChange={(e) => handleInputChange('github', 'repoVisibility', e.target.value)}
                        >
                          <option value="private">Private</option>
                          <option value="public">Public</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>CI/CD Enabled</label>
                        <select
                          value={formData.github?.ciCdEnabled ? 'enabled' : 'disabled'}
                          onChange={(e) => handleInputChange('github', 'ciCdEnabled', e.target.value === 'enabled')}
                        >
                          <option value="disabled">Disabled</option>
                          <option value="enabled">Enabled</option>
                        </select>
                      </div>
                      <div className="form-group full-width">
                        <label>Access Token</label>
                        <div className="password-input">
                          <input
                            type="password"
                            value={formData.github?.accessToken || ''}
                            onChange={(e) => handleInputChange('github', 'accessToken', e.target.value)}
                            placeholder="GitHub Personal Access Token"
                          />
                          <button type="button" className="btn-icon" onClick={() => copyToClipboard(formData.github?.accessToken || '')}>
                            <FiCopy />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Database Section */}
              {activeSection === 'database' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiDatabase className="section-icon" />
                    <h3>Database Configuration</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Database Type</label>
                        <select
                          value={formData.database?.type || 'mongodb'}
                          onChange={(e) => handleInputChange('database', 'type', e.target.value)}
                        >
                          {databaseTypes.map(type => (
                            <option key={type} value={type}>
                              {type.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Host</label>
                        <input
                          type="text"
                          value={formData.database?.host || ''}
                          onChange={(e) => handleInputChange('database', 'host', e.target.value)}
                          placeholder="localhost, mongodb://..."
                        />
                      </div>
                      <div className="form-group">
                        <label>Port</label>
                        <input
                          type="text"
                          value={formData.database?.port || ''}
                          onChange={(e) => handleInputChange('database', 'port', e.target.value)}
                          placeholder="27017, 3306, 5432"
                        />
                      </div>
                      <div className="form-group">
                        <label>Database Name</label>
                        <input
                          type="text"
                          value={formData.database?.databaseName || ''}
                          onChange={(e) => handleInputChange('database', 'databaseName', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Username</label>
                        <input
                          type="text"
                          value={formData.database?.username || ''}
                          onChange={(e) => handleInputChange('database', 'username', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <div className="password-input">
                          <input
                            type="password"
                            value={formData.database?.password || ''}
                            onChange={(e) => handleInputChange('database', 'password', e.target.value)}
                          />
                          <button type="button" className="btn-icon" onClick={() => copyToClipboard(formData.database?.password || '')}>
                            <FiCopy />
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Backup Enabled</label>
                        <select
                          value={formData.database?.backupEnabled ? 'enabled' : 'disabled'}
                          onChange={(e) => handleInputChange('database', 'backupEnabled', e.target.value === 'enabled')}
                        >
                          <option value="disabled">Disabled</option>
                          <option value="enabled">Enabled</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Backup Frequency</label>
                        <select
                          value={formData.database?.backupFrequency || 'daily'}
                          onChange={(e) => handleInputChange('database', 'backupFrequency', e.target.value)}
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div className="form-group full-width">
                        <label>Connection URL</label>
                        <input
                          type="text"
                          value={formData.database?.connectionUrl || ''}
                          onChange={(e) => handleInputChange('database', 'connectionUrl', e.target.value)}
                          placeholder="mongodb://username:password@host:port/database"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Technology Stack Section */}
              {activeSection === 'technology' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiCode className="section-icon" />
                    <h3>Technology Stack</h3>
                  </div>
                  <div className="section-content">
                    <div className="tech-stack-container">
                      {/* Left Column - Frontend */}
                      <div className="tech-column">
                        <div className="form-group">
                          <label>Frontend Technologies</label>
                          <div className="tech-tags">
                            {frontendFrameworks.map(framework => (
                              <label key={framework} className="tech-checkbox">
                                <input
                                  type="checkbox"
                                  checked={formData.technology?.frontend?.includes(framework) || false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      addArrayItem('technology', 'frontend', framework);
                                    } else {
                                      removeArrayItem('technology', 'frontend', formData.technology?.frontend?.indexOf(framework) || -1);
                                    }
                                  }}
                                />
                                {framework}
                              </label>
                            ))}
                          </div>
                          
                          <div className="custom-tech-section">
                            <div className="custom-tech-input">
                              <input
                                type="text"
                                placeholder="Add custom frontend technology"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    e.preventDefault();
                                    const tech = e.target.value.trim();
                                    if (!formData.technology?.frontend?.includes(tech)) {
                                      addArrayItem('technology', 'frontend', tech);
                                    }
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="btn-icon"
                                onClick={(e) => {
                                  const input = e.target.previousElementSibling;
                                  if (input.value.trim()) {
                                    const tech = input.value.trim();
                                    if (!formData.technology?.frontend?.includes(tech)) {
                                      addArrayItem('technology', 'frontend', tech);
                                    }
                                    input.value = '';
                                  }
                                }}
                              >
                                <FiPlus /> Add Field
                              </button>
                            </div>
                            <div className="custom-tech-list">
                              {formData.technology?.frontend?.filter(tech => !frontendFrameworks.includes(tech)).map((tech, index) => (
                                <div key={tech} className="custom-tech-item">
                                  <span>{tech}</span>
                                  <button
                                    type="button"
                                    className="btn-icon btn-danger"
                                    onClick={() => {
                                      const actualIndex = formData.technology?.frontend?.indexOf(tech);
                                      if (actualIndex !== -1) {
                                        removeArrayItem('technology', 'frontend', actualIndex);
                                      }
                                    }}
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Backend */}
                      <div className="tech-column">
                        <div className="form-group">
                          <label>Backend Technologies</label>
                          <div className="tech-tags">
                            {backendFrameworks.map(framework => (
                              <label key={framework} className="tech-checkbox">
                                <input
                                  type="checkbox"
                                  checked={formData.technology?.backend?.includes(framework) || false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      addArrayItem('technology', 'backend', framework);
                                    } else {
                                      removeArrayItem('technology', 'backend', formData.technology?.backend?.indexOf(framework) || -1);
                                    }
                                  }}
                                />
                                {framework}
                              </label>
                            ))}
                          </div>
                          
                          <div className="custom-tech-section">
                            <div className="custom-tech-input">
                              <input
                                type="text"
                                placeholder="Add custom backend technology"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    e.preventDefault();
                                    const tech = e.target.value.trim();
                                    if (!formData.technology?.backend?.includes(tech)) {
                                      addArrayItem('technology', 'backend', tech);
                                    }
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="btn-icon"
                                onClick={(e) => {
                                  const input = e.target.previousElementSibling;
                                  if (input.value.trim()) {
                                    const tech = input.value.trim();
                                    if (!formData.technology?.backend?.includes(tech)) {
                                      addArrayItem('technology', 'backend', tech);
                                    }
                                    input.value = '';
                                  }
                                }}
                              >
                                <FiPlus /> Add Field
                              </button>
                            </div>
                            <div className="custom-tech-list">
                              {formData.technology?.backend?.filter(tech => !backendFrameworks.includes(tech)).map((tech, index) => (
                                <div key={tech} className="custom-tech-item">
                                  <span>{tech}</span>
                                  <button
                                    type="button"
                                    className="btn-icon btn-danger"
                                    onClick={() => {
                                      const actualIndex = formData.technology?.backend?.indexOf(tech);
                                      if (actualIndex !== -1) {
                                        removeArrayItem('technology', 'backend', actualIndex);
                                      }
                                    }}
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginTop: '1rem', maxWidth: '300px' }}>
                      <label>Package Manager</label>
                      <select
                        value={formData.technology?.packageManager || 'npm'}
                        onChange={(e) => handleInputChange('technology', 'packageManager', e.target.value)}
                      >
                        <option value="npm">NPM</option>
                        <option value="yarn">Yarn</option>
                        <option value="pnpm">PNPM</option>
                        <option value="composer">Composer</option>
                        <option value="pip">PIP</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Documentation Section */}
              {activeSection === 'documentation' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiFileText className="section-icon" />
                    <h3>Project Documentation</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Project Documentation</label>
                        <input
                          type="url"
                          value={formData.documentation?.projectDocs || ''}
                          onChange={(e) => handleInputChange('documentation', 'projectDocs', e.target.value)}
                          placeholder="Link to project documentation"
                        />
                      </div>
                      <div className="form-group">
                        <label>API Documentation</label>
                        <input
                          type="url"
                          value={formData.documentation?.apiDocs || ''}
                          onChange={(e) => handleInputChange('documentation', 'apiDocs', e.target.value)}
                          placeholder="Link to API docs (Swagger, Postman, etc.)"
                        />
                      </div>
                      <div className="form-group">
                        <label>User Manual</label>
                        <input
                          type="url"
                          value={formData.documentation?.userManual || ''}
                          onChange={(e) => handleInputChange('documentation', 'userManual', e.target.value)}
                          placeholder="Link to user manual"
                        />
                      </div>
                      <div className="form-group">
                        <label>Deployment Guide</label>
                        <input
                          type="url"
                          value={formData.documentation?.deploymentGuide || ''}
                          onChange={(e) => handleInputChange('documentation', 'deploymentGuide', e.target.value)}
                          placeholder="Link to deployment guide"
                        />
                      </div>
                      <div className="form-group">
                        <label>Architecture Diagrams</label>
                        <input
                          type="url"
                          value={formData.documentation?.architectureDiagrams || ''}
                          onChange={(e) => handleInputChange('documentation', 'architectureDiagrams', e.target.value)}
                          placeholder="Link to architecture diagrams"
                        />
                      </div>
                      <div className="form-group">
                        <label>Change Log</label>
                        <input
                          type="url"
                          value={formData.documentation?.changeLog || ''}
                          onChange={(e) => handleInputChange('documentation', 'changeLog', e.target.value)}
                          placeholder="Link to change log"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Environment Section */}
              {activeSection === 'environment' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiSettings className="section-icon" />
                    <h3>Environment & Configuration</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>.env File Location</label>
                        <input
                          type="text"
                          value={formData.environment?.envFile || ''}
                          onChange={(e) => handleInputChange('environment', 'envFile', e.target.value)}
                          placeholder="Path to .env file"
                        />
                      </div>
                      <div className="form-group">
                        <label>Staging URL</label>
                        <input
                          type="url"
                          value={formData.environment?.stagingUrl || ''}
                          onChange={(e) => handleInputChange('environment', 'stagingUrl', e.target.value)}
                          placeholder="https://staging.example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Production URL</label>
                        <input
                          type="url"
                          value={formData.environment?.productionUrl || ''}
                          onChange={(e) => handleInputChange('environment', 'productionUrl', e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Testing URL</label>
                        <input
                          type="url"
                          value={formData.environment?.testingUrl || ''}
                          onChange={(e) => handleInputChange('environment', 'testingUrl', e.target.value)}
                          placeholder="https://test.example.com"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Development Notes</label>
                        <textarea
                          value={formData.environment?.developmentNotes || ''}
                          onChange={(e) => handleInputChange('environment', 'developmentNotes', e.target.value)}
                          placeholder="Any development-specific notes or instructions"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Frontend Section */}
              {activeSection === 'frontend' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiMonitor className="section-icon" />
                    <h3>Frontend Details</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Bundler</label>
                        <select
                          value={formData.frontend?.bundler || 'webpack'}
                          onChange={(e) => handleInputChange('frontend', 'bundler', e.target.value)}
                        >
                          <option value="webpack">Webpack</option>
                          <option value="vite">Vite</option>
                          <option value="rollup">Rollup</option>
                          <option value="parcel">Parcel</option>
                          <option value="esbuild">ESBuild</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Build Tools</label>
                        <input
                          type="text"
                          value={formData.frontend?.buildTools?.join(', ') || ''}
                          onChange={(e) => handleInputChange('frontend', 'buildTools', e.target.value.split(', ').filter(Boolean))}
                          placeholder="Babel, PostCSS, Sass, etc."
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Landing Pages</label>
                        <textarea
                          value={formData.frontend?.landingPages?.join('\n') || ''}
                          onChange={(e) => handleInputChange('frontend', 'landingPages', e.target.value.split('\n').filter(Boolean))}
                          placeholder="List landing pages (one per line)"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Backend Section */}
              {activeSection === 'backend' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiServer className="section-icon" />
                    <h3>Backend Services</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Authentication Method</label>
                        <select
                          value={formData.backend?.authentication || 'jwt'}
                          onChange={(e) => handleInputChange('backend', 'authentication', e.target.value)}
                        >
                          <option value="jwt">JWT</option>
                          <option value="session">Session</option>
                          <option value="oauth">OAuth</option>
                          <option value="basic">Basic Auth</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Rate Limiting</label>
                        <select
                          value={formData.backend?.rateLimiting ? 'enabled' : 'disabled'}
                          onChange={(e) => handleInputChange('backend', 'rateLimiting', e.target.value === 'enabled')}
                        >
                          <option value="disabled">Disabled</option>
                          <option value="enabled">Enabled</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>CORS Enabled</label>
                        <select
                          value={formData.backend?.corsEnabled ? 'enabled' : 'disabled'}
                          onChange={(e) => handleInputChange('backend', 'corsEnabled', e.target.value === 'enabled')}
                        >
                          <option value="disabled">Disabled</option>
                          <option value="enabled">Enabled</option>
                        </select>
                      </div>
                      <div className="form-group full-width">
                        <label>APIs</label>
                        <textarea
                          value={formData.backend?.apis?.join('\n') || ''}
                          onChange={(e) => handleInputChange('backend', 'apis', e.target.value.split('\n').filter(Boolean))}
                          placeholder="List API endpoints or services (one per line)"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiShield className="section-icon" />
                    <h3>Security & Monitoring</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>SSL Certificate</label>
                        <select
                          value={formData.security?.sslCertificate ? 'enabled' : 'disabled'}
                          onChange={(e) => handleInputChange('security', 'sslCertificate', e.target.value === 'enabled')}
                        >
                          <option value="disabled">Disabled</option>
                          <option value="enabled">Enabled</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Firewall Enabled</label>
                        <select
                          value={formData.security?.firewallEnabled ? 'enabled' : 'disabled'}
                          onChange={(e) => handleInputChange('security', 'firewallEnabled', e.target.value === 'enabled')}
                        >
                          <option value="disabled">Disabled</option>
                          <option value="enabled">Enabled</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Monitoring Enabled</label>
                        <select
                          value={formData.security?.monitoringEnabled ? 'enabled' : 'disabled'}
                          onChange={(e) => handleInputChange('security', 'monitoringEnabled', e.target.value === 'enabled')}
                        >
                          <option value="disabled">Disabled</option>
                          <option value="enabled">Enabled</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Analytics Service</label>
                        <input
                          type="text"
                          value={formData.security?.analytics || ''}
                          onChange={(e) => handleInputChange('security', 'analytics', e.target.value)}
                          placeholder="Google Analytics, Mixpanel, etc."
                        />
                      </div>
                      <div className="form-group">
                        <label>Error Tracking</label>
                        <input
                          type="text"
                          value={formData.security?.errorTracking || ''}
                          onChange={(e) => handleInputChange('security', 'errorTracking', e.target.value)}
                          placeholder="Sentry, Bugsnag, etc."
                        />
                      </div>
                      <div className="form-group">
                        <label>Uptime Monitoring</label>
                        <input
                          type="text"
                          value={formData.security?.uptimeMonitoring || ''}
                          onChange={(e) => handleInputChange('security', 'uptimeMonitoring', e.target.value)}
                          placeholder="UptimeRobot, Pingdom, etc."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Development Section */}
              {activeSection === 'development' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiCode className="section-icon" />
                    <h3>Development Details</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Developer Name</label>
                        <input
                          type="text"
                          value={formData.development?.developerName || ''}
                          onChange={(e) => handleInputChange('development', 'developerName', e.target.value)}
                          placeholder="Developer/Company Name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Development Cost (₹)</label>
                        <input
                          type="number"
                          value={formData.development?.developmentCost || ''}
                          onChange={(e) => handleInputChange('development', 'developmentCost', e.target.value)}
                          placeholder="Total development cost"
                        />
                      </div>
                      <div className="form-group">
                        <label>Development Duration</label>
                        <div className="duration-input">
                          <input
                            type="number"
                            value={formData.development?.developmentDuration || ''}
                            onChange={(e) => handleInputChange('development', 'developmentDuration', e.target.value)}
                            placeholder="e.g. 3"
                          />
                          <select
                            value={formData.development?.developmentDurationUnit || 'months'}
                            onChange={(e) => handleInputChange('development', 'developmentDurationUnit', e.target.value)}
                          >
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                            <option value="months">Months</option>
                            <option value="years">Years</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Monitoring Section */}
              {activeSection === 'monitoring' && (
                <div className="static-section">
                  <div className="section-header">
                    <FiShield className="section-icon" />
                    <h3>Monitoring Details</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Monitoring Provider</label>
                        <input
                          type="text"
                          value={formData.monitoring?.monitoringProvider || ''}
                          onChange={(e) => handleInputChange('monitoring', 'monitoringProvider', e.target.value)}
                          placeholder="e.g., UptimeRobot, Pingdom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Monthly Cost (₹)</label>
                        <input
                          type="number"
                          value={formData.monitoring?.monitoringCost || ''}
                          onChange={(e) => handleInputChange('monitoring', 'monitoringCost', e.target.value)}
                          placeholder="Monthly monitoring cost"
                        />
                      </div>
                      <div className="form-group">
                        <label>Billing Cycle</label>
                        <select
                          value={formData.monitoring?.monitoringDurationUnit || 'months'}
                          onChange={(e) => handleInputChange('monitoring', 'monitoringDurationUnit', e.target.value)}
                        >
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="static-section">
                <div className="section-header">
                  <FiFileText className="section-icon" />
                  <h3>Additional Notes</h3>
                </div>
                <div className="section-content">
                  <div className="form-group full-width">
                    <label>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange(null, 'notes', e.target.value)}
                      placeholder="Any additional information, reminders, or important details about this website"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Security Warning */}
              <div className="security-warning">
                <FiAlertCircle className="warning-icon" />
                <div className="warning-content">
                  <h4>Security Notice</h4>
                  <p>This system stores sensitive credentials. Ensure your device is secure and consider using a password manager for critical credentials.</p>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Custom Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="success-popup-icon">
            <FiCheckCircle />
          </div>
          <div className="success-popup-message">
            {successMessage}
          </div>
          <button
            className="success-popup-close"
            onClick={() => setShowSuccessPopup(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default DigitalAssets;
