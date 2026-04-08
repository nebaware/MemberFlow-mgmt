import fs from 'fs';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';

const initialDb = {
  organizations: [
    {
      id: 'org-main',
      name: 'MemberFlow Pro Organization',
      slug: 'memberflow-main',
      status: 'active',
      config: { customAttributeDefinitions: [] },
    },
  ],
  users: [
    {
      uid: 'admin-123',
      fullName: 'System Admin',
      email: 'nebiyutsegaye213@gmail.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'super_admin',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ],
  payments: [],
  subscriptions: [],
  events: [],
  blogs: [],
  auditLogs: [],
  systemConfig: {
    systemName: 'MemberFlow OMMS',
    defaultTheme: 'midnight-emerald',
  },
};

export class DbService {
  private static instance: DbService;
  private dbPath: string;

  private constructor() {
    this.dbPath = config.DB_PATH;
    this.init();
  }

  public static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

  private init() {
    if (!fs.existsSync(this.dbPath)) {
      this.save(initialDb);
    }
  }

  public get(): any {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      if (!Array.isArray(parsed.auditLogs)) parsed.auditLogs = [];
      if (!Array.isArray(parsed.subscriptions)) parsed.subscriptions = [];
      if (!parsed.systemConfig) {
        parsed.systemConfig = initialDb.systemConfig;
      }
      return parsed;
    } catch (e) {
      return initialDb;
    }
  }

  public save(data: any): void {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }
}

export const dbService = DbService.getInstance();
