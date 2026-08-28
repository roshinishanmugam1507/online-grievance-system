import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Path to root localStorage folder
const STORAGE_DIR = path.resolve(__dirname, '../localStorage');

// Required JSON storage files
const STORAGE_FILES = {
  USERS: 'users.json',
  GRIEVANCES: 'grievances.json',
  NOTIFICATIONS: 'notifications.json',
  FEEDBACK: 'feedback.json',
  ACTIVITY_LOGS: 'activity_logs.json',
  DEPARTMENTS: 'departments.json',
  OFFICERS: 'officers.json',
  TRACKING: 'tracking.json',
  SESSIONS: 'sessions.json'
};

// Initial Seed Data for Lookups if files are empty
const DEFAULT_DEPARTMENTS = [
  { id: "dept-1", name: "Roads & Transport", code: "RND", description: "Maintenance of city roads, pavements, potholes, traffic signaling, and pedestrian infrastructure.", head: "Er. S. Venkataraman", email: "roads@grievance.gov.demo", phone: "044-25619001", status: "Active", createdAt: "2025-01-10T09:00:00.000Z" },
  { id: "dept-2", name: "Water Supply & Sewerage", code: "WSS", description: "Municipal piped water supply, drinking water purity, pipeline leakages, and sewerage network.", head: "Er. K. Meenakshi", email: "water@grievance.gov.demo", phone: "044-25619002", status: "Active", createdAt: "2025-01-10T09:00:00.000Z" },
  { id: "dept-3", name: "Electricity Board (TNEB)", code: "ELE", description: "Power distribution, transformer maintenance, frequent outages, hanging cables, and electric safety.", head: "Er. R. Soundararajan", email: "electricity@grievance.gov.demo", phone: "044-25619003", status: "Active", createdAt: "2025-01-10T09:00:00.000Z" },
  { id: "dept-4", name: "Solid Waste & Sanitation", code: "SAN", description: "Door-to-door waste collection, street sweeping, garbage bin clearance, and anti-littering enforcement.", head: "Dr. P. Arumugam", email: "sanitation@grievance.gov.demo", phone: "044-25619004", status: "Active", createdAt: "2025-01-10T09:00:00.000Z" },
  { id: "dept-5", name: "Public Health & Malaria Control", code: "HLT", description: "Mosquito fogging, stagnant water treatment, vector control, clinic sanitation, and food safety inspection.", head: "Dr. Deepa Natarajan", email: "health@grievance.gov.demo", phone: "044-25619005", status: "Active", createdAt: "2025-01-10T09:00:00.000Z" },
  { id: "dept-6", name: "Street Lighting & Electricals", code: "LGT", description: "LED streetlights, dark spot illumination, timer automation, and cable fault repairs.", head: "Er. M. Saravanan", email: "lighting@grievance.gov.demo", phone: "044-25619006", status: "Active", createdAt: "2025-01-10T09:00:00.000Z" },
  { id: "dept-7", name: "Storm Water Drainage", code: "DRN", description: "Monsoon flood preparedness, stormwater drain desilting, culvert maintenance, and water logging redressal.", head: "Er. N. Raghuram", email: "drainage@grievance.gov.demo", phone: "044-25619007", status: "Active", createdAt: "2025-01-10T09:00:00.000Z" },
  { id: "dept-8", name: "Parks, Playgrounds & Greenery", code: "PRK", description: "Public park upkeep, play equipment maintenance, tree pruning, sapling plantation, and botanical gardens.", head: "Smt. Shanthi Mohan", email: "parks@grievance.gov.demo", phone: "044-25619008", status: "Active", createdAt: "2025-01-10T09:00:00.000Z" }
];

const DEFAULT_OFFICERS = [
  { id: "off-1", userId: "user-off-1", name: "Officer Rajesh Kumar", email: "officer@grievance.gov.demo", phone: "9840112233", departmentId: "dept-1", designation: "Assistant Executive Engineer", zone: "Zone 5 - Royapuram", status: "Active", createdAt: "2025-01-15T10:00:00.000Z" },
  { id: "off-2", userId: "user-off-2", name: "Officer Priya Sundaram", email: "priya.roads@grievance.gov.demo", phone: "9840112234", departmentId: "dept-1", designation: "Assistant Engineer (Roads)", zone: "Zone 5 - Royapuram", status: "Active", createdAt: "2025-01-15T10:00:00.000Z" },
  { id: "off-3", userId: "user-off-3", name: "Officer Anand Narayanan", email: "anand.water@grievance.gov.demo", phone: "9840112235", departmentId: "dept-2", designation: "Water Works Inspector", zone: "Zone 10 - Kodambakkam", status: "Active", createdAt: "2025-01-15T10:00:00.000Z" },
  { id: "off-4", userId: "user-off-4", name: "Officer Suresh Babu", email: "suresh.water@grievance.gov.demo", phone: "9840112236", departmentId: "dept-2", designation: "Sewerage Network Engineer", zone: "Zone 13 - Adyar", status: "Active", createdAt: "2025-01-15T10:00:00.000Z" },
  { id: "off-5", userId: "user-off-5", name: "Officer Vigneshwaran R.", email: "vignesh.elec@grievance.gov.demo", phone: "9840112237", departmentId: "dept-3", designation: "Junior Engineer (Distribution)", zone: "Zone 6 - Thiru Vi Ka Nagar", status: "Active", createdAt: "2025-01-15T10:00:00.000Z" },
  { id: "off-6", userId: "user-off-6", name: "Officer Manjula Devi", email: "manjula.waste@grievance.gov.demo", phone: "9840112238", departmentId: "dept-4", designation: "Sanitary Inspector", zone: "Zone 8 - Kilpauk", status: "Active", createdAt: "2025-01-15T10:00:00.000Z" },
  { id: "off-7", userId: "user-off-7", name: "Dr. Harish Madhavan", email: "harish.health@grievance.gov.demo", phone: "9840112239", departmentId: "dept-5", designation: "Medical Officer of Health", zone: "Zone 9 - Mylapore", status: "Active", createdAt: "2025-01-15T10:00:00.000Z" },
  { id: "off-8", userId: "user-off-8", name: "Officer Manikandan S.", email: "mani.lighting@grievance.gov.demo", phone: "9840112240", departmentId: "dept-6", designation: "Electrical Supervisor", zone: "Zone 11 - Valasaravakkam", status: "Active", createdAt: "2025-01-15T10:00:00.000Z" },
  { id: "off-9", userId: "user-off-9", name: "Officer Saravanan G.", email: "saravanan.drain@grievance.gov.demo", phone: "9840112241", departmentId: "dept-7", designation: "Storm Drainage Inspector", zone: "Zone 7 - Ambattur", status: "Active", createdAt: "2025-01-15T10:00:00.000Z" },
  { id: "off-10", userId: "user-off-10", name: "Officer Balamurugan T.", email: "bala.roads@grievance.gov.demo", phone: "9840112242", departmentId: "dept-1", designation: "Highway Quality Supervisor", zone: "Zone 14 - Perungudi", status: "Active", createdAt: "2025-01-15T10:00:00.000Z" }
];

// Helper: Hash password for safe local storage
const hashPassword = (plain) => {
  return crypto.createHash('sha256').update(plain || '').digest('hex');
};

// Ensure Storage Directory and JSON files exist
const initStorage = () => {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
      console.log(`[Storage Server] Created directory: ${STORAGE_DIR}`);
    }

    Object.values(STORAGE_FILES).forEach((fileName) => {
      const filePath = path.join(STORAGE_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        // Initialize departments and officers with default lookup items if fresh
        if (fileName === STORAGE_FILES.DEPARTMENTS) {
          fs.writeFileSync(filePath, JSON.stringify(DEFAULT_DEPARTMENTS, null, 2), 'utf8');
        } else if (fileName === STORAGE_FILES.OFFICERS) {
          fs.writeFileSync(filePath, JSON.stringify(DEFAULT_OFFICERS, null, 2), 'utf8');
        } else {
          fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
        }
        console.log(`[Storage Server] Initialized JSON file: ${fileName}`);
      }
    });
  } catch (error) {
    console.error('[Storage Server] Failed to initialize storage directory or files:', error);
  }
};

// Atomic JSON Read & Write Helpers
const readJSON = (fileName) => {
  const filePath = path.join(STORAGE_DIR, fileName);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf8').trim();
    if (!content) return [];
    return JSON.parse(content);
  } catch (error) {
    console.error(`[Storage Server] Error reading JSON file ${fileName}:`, error);
    return [];
  }
};

const writeJSON = (fileName, data) => {
  const filePath = path.join(STORAGE_DIR, fileName);
  const tempPath = path.join(STORAGE_DIR, `${fileName}.${Date.now()}.tmp`);
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, jsonString, 'utf8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (error) {
    console.error(`[Storage Server] Error writing JSON file ${fileName}:`, error);
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    throw error;
  }
};

// Sequential ID Generator
const generateId = (prefix, list = []) => {
  let maxId = 0;
  const regex = new RegExp(`^${prefix}-(\\d+)`, 'i');
  for (const item of list) {
    if (item && item.id) {
      const match = String(item.id).match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    }
  }
  const next = maxId + 1;
  return `${prefix}-${String(next).padStart(4, '0')}`;
};

// Automatic Activity Logger
const recordActivity = (userId, action, referenceId, details) => {
  try {
    const logs = readJSON(STORAGE_FILES.ACTIVITY_LOGS);
    const newLog = {
      id: generateId('ACT', logs),
      userId: userId || 'SYSTEM',
      action,
      referenceId: referenceId || null,
      details: details || '',
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    writeJSON(STORAGE_FILES.ACTIVITY_LOGS, logs);
    return newLog;
  } catch (error) {
    console.error('[Storage Server] Failed to record activity log:', error);
  }
};

// Automatic Notification Creator
const createNotificationRecord = (userId, grievanceId, title, message, type = 'grievance') => {
  try {
    const notifs = readJSON(STORAGE_FILES.NOTIFICATIONS);
    const newNotif = {
      id: generateId('NOT', notifs),
      userId,
      grievanceId: grievanceId || null,
      title,
      message,
      type,
      isRead: false,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifs.push(newNotif);
    writeJSON(STORAGE_FILES.NOTIFICATIONS, notifs);
    recordActivity(userId, 'NOTIFICATION_CREATED', newNotif.id, `Notification sent: ${title}`);
    return newNotif;
  } catch (error) {
    console.error('[Storage Server] Failed to record notification:', error);
  }
};

// Strip password from user object
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, passwordHash, ...safeUser } = user;
  return safeUser;
};

// Initialize server middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[Storage API] ${req.method} ${req.originalUrl}`);
  next();
});

// Initialize storage files
initStorage();

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, address, password, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const users = readJSON(STORAGE_FILES.USERS);
    const normalizedEmail = email.toLowerCase().trim();

    const exists = users.some((u) => u.email.toLowerCase().trim() === normalizedEmail);
    if (exists) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newUser = {
      id: generateId('USR', users),
      name: name.trim(),
      email: normalizedEmail,
      phone: (phone || '').trim(),
      address: (address || '').trim(),
      passwordHash: hashPassword(password),
      role: role || 'citizen',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON(STORAGE_FILES.USERS, users);

    // Automatic Activity Logging
    recordActivity(newUser.id, 'USER_REGISTERED', newUser.id, `Citizen registered successfully (${newUser.name})`);

    // Automatic Welcome Notification
    createNotificationRecord(
      newUser.id,
      null,
      'Welcome to OPGRS',
      'Your citizen account has been successfully registered on the Public Grievance portal.',
      'account'
    );

    const safeUser = sanitizeUser(newUser);
    const session = {
      token: `token-${newUser.id}-${Date.now()}`,
      user: safeUser
    };

    // Record session
    const sessions = readJSON(STORAGE_FILES.SESSIONS);
    sessions.push({ ...session, createdAt: new Date().toISOString() });
    writeJSON(STORAGE_FILES.SESSIONS, sessions);

    return res.status(201).json(session);
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'Internal Server Error during registration' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = readJSON(STORAGE_FILES.USERS);
    const normalizedEmail = email.toLowerCase().trim();
    const hashed = hashPassword(password);

    // Support both hashed password and legacy plaintext matches for demo migration
    const user = users.find(
      (u) =>
        u.email.toLowerCase().trim() === normalizedEmail &&
        (u.passwordHash === hashed || u.password === password)
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact administration.' });
    }

    const safeUser = sanitizeUser(user);
    const session = {
      token: `token-${user.id}-${Date.now()}`,
      user: safeUser
    };

    // Automatic Activity Logging
    recordActivity(user.id, 'USER_LOGIN', user.id, `User logged in (${user.email})`);

    const sessions = readJSON(STORAGE_FILES.SESSIONS);
    sessions.push({ ...session, createdAt: new Date().toISOString() });
    writeJSON(STORAGE_FILES.SESSIONS, sessions);

    return res.status(200).json(session);
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal Server Error during login' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const sessions = readJSON(STORAGE_FILES.SESSIONS);
    const session = sessions.find((s) => s.token === token);

    if (!session) {
      return res.status(401).json({ error: 'Session expired or invalid.' });
    }

    const users = readJSON(STORAGE_FILES.USERS);
    const user = users.find((u) => u.id === session.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error fetching current session:', error);
    return res.status(500).json({ error: 'Internal Server Error fetching session' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  try {
    const { userId } = req.body || {};
    recordActivity(userId || 'ANONYMOUS', 'USER_LOGOUT', userId || null, 'User logged out');
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ error: 'Internal Server Error during logout' });
  }
});

// ==========================================
// 2. USERS ENDPOINTS (/api/users)
// ==========================================

// GET /api/users
app.get('/api/users', (req, res) => {
  try {
    const users = readJSON(STORAGE_FILES.USERS);
    return res.status(200).json(users.map(sanitizeUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to read users from storage' });
  }
});

// POST /api/users
app.post('/api/users', (req, res) => {
  try {
    const users = readJSON(STORAGE_FILES.USERS);
    const { name, email, phone, address, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (users.some((u) => u.email.toLowerCase().trim() === normalizedEmail)) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const newUser = {
      id: generateId('USR', users),
      name: name.trim(),
      email: normalizedEmail,
      phone: (phone || '').trim(),
      address: (address || '').trim(),
      passwordHash: hashPassword(password || 'password123'),
      role: role || 'citizen',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON(STORAGE_FILES.USERS, users);

    recordActivity(newUser.id, 'USER_REGISTERED', newUser.id, `User created via Admin API (${newUser.name})`);

    return res.status(201).json(sanitizeUser(newUser));
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Failed to create user in storage' });
  }
});

// GET /api/users/:id
app.get('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const users = readJSON(STORAGE_FILES.USERS);
    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: `User with ID ${id} not found.` });
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch user from storage' });
  }
});

// PUT /api/users/:id
app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const users = readJSON(STORAGE_FILES.USERS);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `User with ID ${id} not found.` });
    }

    const existing = users[index];
    const updated = {
      ...existing,
      ...req.body,
      id: existing.id, // Preserve ID
      email: existing.email, // Preserve primary email
      updatedAt: new Date().toISOString()
    };

    if (req.body.password) {
      updated.passwordHash = hashPassword(req.body.password);
      delete updated.password;
    }

    users[index] = updated;
    writeJSON(STORAGE_FILES.USERS, users);

    recordActivity(updated.id, 'USER_PROFILE_UPDATED', updated.id, `Profile details updated for ${updated.name}`);

    return res.status(200).json(sanitizeUser(updated));
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Failed to update user in storage' });
  }
});

// ==========================================
// 3. GRIEVANCES ENDPOINTS (/api/grievances)
// ==========================================

// GET /api/grievances
app.get('/api/grievances', (req, res) => {
  try {
    let grievances = readJSON(STORAGE_FILES.GRIEVANCES);
    const { userId, officerId, departmentId, status } = req.query;

    if (userId) {
      grievances = grievances.filter((g) => g.userId === userId);
    }
    if (officerId) {
      grievances = grievances.filter((g) => g.officerId === officerId);
    }
    if (departmentId) {
      grievances = grievances.filter((g) => g.departmentId === departmentId);
    }
    if (status) {
      grievances = grievances.filter((g) => g.status === status);
    }

    return res.status(200).json(grievances);
  } catch (error) {
    console.error('Error fetching grievances:', error);
    return res.status(500).json({ error: 'Failed to fetch grievances from storage' });
  }
});

// GET /api/grievances/:id
app.get('/api/grievances/:id', (req, res) => {
  try {
    const { id } = req.params;
    const grievances = readJSON(STORAGE_FILES.GRIEVANCES);
    const found = grievances.find((g) => g.id === id || g.complaintId === id);

    if (!found) {
      return res.status(404).json({ error: `Grievance with identifier ${id} not found.` });
    }

    // Automatic Activity Logging
    recordActivity(req.query.userId || found.userId || 'CITIZEN', 'GRIEVANCE_VIEWED', found.id, `Viewed grievance details (${found.complaintId || found.id})`);

    return res.status(200).json(found);
  } catch (error) {
    console.error('Error fetching grievance by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch grievance from storage' });
  }
});

// POST /api/grievances
app.post('/api/grievances', (req, res) => {
  try {
    const grievances = readJSON(STORAGE_FILES.GRIEVANCES);
    const trackingList = readJSON(STORAGE_FILES.TRACKING);

    const newId = generateId('GRV', grievances);
    const complaintId = req.body.complaintId || newId;

    const newGrievance = {
      id: newId,
      complaintId,
      userId: req.body.userId || 'USR-0001',
      citizenName: req.body.citizenName || 'Citizen',
      citizenEmail: req.body.citizenEmail || '',
      citizenPhone: req.body.citizenPhone || '',
      category: req.body.category || req.body.categoryId || 'General',
      categoryId: req.body.categoryId || req.body.category || 'General',
      departmentId: req.body.departmentId || null,
      officerId: req.body.officerId || null,
      subject: req.body.subject || req.body.title || 'Civic Grievance',
      title: req.body.title || req.body.subject || 'Civic Grievance',
      description: req.body.description || '',
      location: req.body.location || 'Municipal Area',
      status: req.body.status || 'Submitted',
      priority: req.body.priority || 'Medium',
      attachment: req.body.attachment || null,
      adminRemarks: req.body.adminRemarks || null,
      resolutionDetails: req.body.resolutionDetails || null,
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null
    };

    // 1. Append grievance
    grievances.push(newGrievance);
    writeJSON(STORAGE_FILES.GRIEVANCES, grievances);

    // 2. Append initial tracking event
    const initialTracking = {
      id: generateId('TRK', trackingList),
      grievanceId: newGrievance.id,
      status: 'Submitted',
      message: 'Grievance registered successfully by citizen via portal.',
      updatedBy: newGrievance.citizenName,
      updatedByRole: 'citizen',
      timestamp: new Date().toISOString()
    };
    trackingList.push(initialTracking);
    writeJSON(STORAGE_FILES.TRACKING, trackingList);

    // 3. Automatic Notification
    createNotificationRecord(
      newGrievance.userId,
      newGrievance.id,
      'Grievance Registered',
      `Your grievance ${newGrievance.complaintId} has been successfully registered.`,
      'grievance'
    );

    // 4. Automatic Activity Logging
    recordActivity(
      newGrievance.userId,
      'GRIEVANCE_SUBMITTED',
      newGrievance.id,
      `New grievance submitted: ${newGrievance.title} (${newGrievance.complaintId})`
    );

    return res.status(201).json(newGrievance);
  } catch (error) {
    console.error('Error submitting grievance:', error);
    return res.status(500).json({ error: 'Failed to persist grievance to storage' });
  }
});

// PUT /api/grievances/:id
app.put('/api/grievances/:id', handleGrievanceUpdate);
// PATCH /api/grievances/:id
app.patch('/api/grievances/:id', handleGrievanceUpdate);

function handleGrievanceUpdate(req, res) {
  try {
    const { id } = req.params;
    const grievances = readJSON(STORAGE_FILES.GRIEVANCES);
    const trackingList = readJSON(STORAGE_FILES.TRACKING);

    const index = grievances.findIndex((g) => g.id === id || g.complaintId === id);
    if (index === -1) {
      return res.status(404).json({ error: `Grievance ${id} not found.` });
    }

    const previous = grievances[index];
    const isStatusChange = req.body.status && req.body.status !== previous.status;
    const now = new Date().toISOString();

    const updated = {
      ...previous,
      ...req.body,
      id: previous.id,
      complaintId: previous.complaintId || previous.id,
      updatedAt: now
    };

    if (req.body.status === 'Resolved' && !updated.resolvedAt) {
      updated.resolvedAt = now;
    }

    grievances[index] = updated;
    writeJSON(STORAGE_FILES.GRIEVANCES, grievances);

    // If status changed, record notification, tracking, and activity log
    if (isStatusChange) {
      // 1. Tracking update
      const newTrk = {
        id: generateId('TRK', trackingList),
        grievanceId: updated.id,
        status: updated.status,
        message: req.body.statusMessage || req.body.remarks || `Status changed from ${previous.status} to ${updated.status}.`,
        updatedBy: req.body.updatedBy || 'Officer / Authority',
        updatedByRole: req.body.updatedByRole || 'authority',
        timestamp: now
      };
      trackingList.push(newTrk);
      writeJSON(STORAGE_FILES.TRACKING, trackingList);

      // 2. Notification
      createNotificationRecord(
        updated.userId,
        updated.id,
        `Grievance Status: ${updated.status}`,
        `Your grievance ${updated.complaintId} has moved to status: ${updated.status}.`,
        'status_change'
      );

      // 3. Activity log
      recordActivity(
        req.body.officerId || req.body.userId || updated.userId,
        'GRIEVANCE_STATUS_UPDATED',
        updated.id,
        `Status of ${updated.complaintId} updated to ${updated.status}`
      );
    } else {
      recordActivity(
        req.body.userId || updated.userId,
        'GRIEVANCE_UPDATED',
        updated.id,
        `Grievance details updated for ${updated.complaintId}`
      );
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating grievance:', error);
    return res.status(500).json({ error: 'Failed to update grievance in storage' });
  }
}

// ==========================================
// 4. NOTIFICATIONS ENDPOINTS (/api/notifications)
// ==========================================

// GET /api/notifications
app.get('/api/notifications', (req, res) => {
  try {
    let notifs = readJSON(STORAGE_FILES.NOTIFICATIONS);
    const { userId } = req.query;

    if (userId) {
      notifs = notifs.filter((n) => n.userId === userId);
    }

    // Newest first
    notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json(notifs);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications from storage' });
  }
});

// POST /api/notifications
app.post('/api/notifications', (req, res) => {
  try {
    const { userId, grievanceId, title, message, type } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required.' });
    }

    const notif = createNotificationRecord(userId, grievanceId, title, message, type);
    return res.status(201).json(notif);
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: 'Failed to save notification' });
  }
});

// PUT /api/notifications/:id & PATCH /api/notifications/:id/read
app.put('/api/notifications/:id', handleNotificationRead);
app.patch('/api/notifications/:id', handleNotificationRead);
app.patch('/api/notifications/:id/read', handleNotificationRead);

function handleNotificationRead(req, res) {
  try {
    const { id } = req.params;
    const notifs = readJSON(STORAGE_FILES.NOTIFICATIONS);
    const index = notifs.findIndex((n) => n.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `Notification ${id} not found.` });
    }

    notifs[index].isRead = true;
    notifs[index].read = true;
    notifs[index].readAt = new Date().toISOString();
    writeJSON(STORAGE_FILES.NOTIFICATIONS, notifs);

    recordActivity(notifs[index].userId, 'NOTIFICATION_READ', id, `Notification marked as read: ${notifs[index].title}`);

    return res.status(200).json(notifs[index]);
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ error: 'Failed to update notification in storage' });
  }
}

// PATCH /api/notifications/mark-all-read
app.patch('/api/notifications/mark-all-read', (req, res) => {
  try {
    const { userId } = req.body || {};
    const notifs = readJSON(STORAGE_FILES.NOTIFICATIONS);

    let updatedCount = 0;
    notifs.forEach((n) => {
      if (!userId || n.userId === userId) {
        if (!n.read && !n.isRead) {
          n.isRead = true;
          n.read = true;
          n.readAt = new Date().toISOString();
          updatedCount++;
        }
      }
    });

    writeJSON(STORAGE_FILES.NOTIFICATIONS, notifs);
    recordActivity(userId || 'ALL_USERS', 'NOTIFICATION_READ', null, `Marked all notifications as read (${updatedCount} updated)`);

    return res.status(200).json({ success: true, count: updatedCount });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

// ==========================================
// 5. FEEDBACK ENDPOINTS (/api/feedback)
// ==========================================

// GET /api/feedback
app.get('/api/feedback', (req, res) => {
  try {
    let feedback = readJSON(STORAGE_FILES.FEEDBACK);
    const { grievanceId, userId } = req.query;

    if (grievanceId) {
      feedback = feedback.filter((f) => f.grievanceId === grievanceId);
    }
    if (userId) {
      feedback = feedback.filter((f) => f.userId === userId);
    }

    feedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({ error: 'Failed to fetch feedback from storage' });
  }
});

// POST /api/feedback
app.post('/api/feedback', (req, res) => {
  try {
    const feedbackList = readJSON(STORAGE_FILES.FEEDBACK);
    const { userId, grievanceId, rating, comments, feedbackText } = req.body;

    if (!grievanceId || (!rating && rating !== 0)) {
      return res.status(400).json({ error: 'grievanceId and rating are required.' });
    }

    const newFeedback = {
      id: generateId('FDB', feedbackList),
      userId: userId || 'USR-0001',
      grievanceId,
      rating: Number(rating),
      comments: comments || feedbackText || '',
      feedbackText: comments || feedbackText || '',
      createdAt: new Date().toISOString()
    };

    feedbackList.push(newFeedback);
    writeJSON(STORAGE_FILES.FEEDBACK, feedbackList);

    // Automatic Activity Logging
    recordActivity(
      newFeedback.userId,
      'FEEDBACK_SUBMITTED',
      newFeedback.id,
      `Feedback submitted for grievance ${grievanceId} (Rating: ${rating}/5)`
    );

    return res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ error: 'Failed to submit feedback to storage' });
  }
});

// ==========================================
// 6. ACTIVITY LOGS ENDPOINTS (/api/activity-logs)
// ==========================================

// GET /api/activity-logs
app.get('/api/activity-logs', (req, res) => {
  try {
    let logs = readJSON(STORAGE_FILES.ACTIVITY_LOGS);
    const { userId, action } = req.query;

    if (userId) {
      logs = logs.filter((l) => l.userId === userId);
    }
    if (action) {
      logs = logs.filter((l) => l.action === action);
    }

    // Newest first
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return res.status(500).json({ error: 'Failed to fetch activity logs from storage' });
  }
});

// POST /api/activity-logs
app.post('/api/activity-logs', (req, res) => {
  try {
    const { userId, action, referenceId, details } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'action name is required.' });
    }

    const log = recordActivity(userId, action, referenceId, details);
    return res.status(201).json(log);
  } catch (error) {
    console.error('Error creating activity log:', error);
    return res.status(500).json({ error: 'Failed to create activity log' });
  }
});

// ==========================================
// 7. DEPARTMENTS, OFFICERS & TRACKING ENDPOINTS
// ==========================================

// GET /api/departments
app.get('/api/departments', (req, res) => {
  try {
    const depts = readJSON(STORAGE_FILES.DEPARTMENTS);
    return res.status(200).json(depts);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read departments' });
  }
});

// POST /api/departments
app.post('/api/departments', (req, res) => {
  try {
    const depts = readJSON(STORAGE_FILES.DEPARTMENTS);
    const newDept = {
      ...req.body,
      id: generateId('DEPT', depts),
      status: req.body.status || 'Active',
      createdAt: new Date().toISOString()
    };
    depts.push(newDept);
    writeJSON(STORAGE_FILES.DEPARTMENTS, depts);
    return res.status(201).json(newDept);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create department' });
  }
});

// PUT /api/departments/:id
app.put('/api/departments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const depts = readJSON(STORAGE_FILES.DEPARTMENTS);
    const index = depts.findIndex((d) => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'Department not found' });

    depts[index] = { ...depts[index], ...req.body };
    writeJSON(STORAGE_FILES.DEPARTMENTS, depts);
    return res.status(200).json(depts[index]);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update department' });
  }
});

// GET /api/officers
app.get('/api/officers', (req, res) => {
  try {
    let officers = readJSON(STORAGE_FILES.OFFICERS);
    const { departmentId } = req.query;
    if (departmentId) {
      officers = officers.filter((o) => o.departmentId === departmentId);
    }
    return res.status(200).json(officers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read officers' });
  }
});

// POST /api/officers
app.post('/api/officers', (req, res) => {
  try {
    const officers = readJSON(STORAGE_FILES.OFFICERS);
    const newOfficer = {
      ...req.body,
      id: generateId('OFF', officers),
      status: req.body.status || 'Active',
      createdAt: new Date().toISOString()
    };
    officers.push(newOfficer);
    writeJSON(STORAGE_FILES.OFFICERS, officers);
    return res.status(201).json(newOfficer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create officer' });
  }
});

// PUT /api/officers/:id
app.put('/api/officers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const officers = readJSON(STORAGE_FILES.OFFICERS);
    const index = officers.findIndex((o) => o.id === id);
    if (index === -1) return res.status(404).json({ error: 'Officer not found' });

    officers[index] = { ...officers[index], ...req.body };
    writeJSON(STORAGE_FILES.OFFICERS, officers);
    return res.status(200).json(officers[index]);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update officer' });
  }
});

// GET /api/tracking
app.get('/api/tracking', (req, res) => {
  try {
    let tracking = readJSON(STORAGE_FILES.TRACKING);
    const { grievanceId } = req.query;
    if (grievanceId) {
      tracking = tracking.filter((t) => t.grievanceId === grievanceId);
    }
    tracking.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return res.status(200).json(tracking);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read tracking timeline' });
  }
});

// POST /api/tracking
app.post('/api/tracking', (req, res) => {
  try {
    const tracking = readJSON(STORAGE_FILES.TRACKING);
    const newTrk = {
      ...req.body,
      id: generateId('TRK', tracking),
      timestamp: req.body.timestamp || new Date().toISOString()
    };
    tracking.push(newTrk);
    writeJSON(STORAGE_FILES.TRACKING, tracking);
    return res.status(201).json(newTrk);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to append tracking entry' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Local JSON Data Storage Server is Running!`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Physical Storage Directory: ${STORAGE_DIR}`);
  console.log(`====================================================`);
});
