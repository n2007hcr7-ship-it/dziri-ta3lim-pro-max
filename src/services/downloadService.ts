import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'dziri_ta3lim_offline';
const STORE_NAME = 'courses';

export interface OfflineCourse {
  id: string;
  title: string;
  teacherName: string;
  subject: string;
  level: string;
  contentType: 'video' | 'pdf' | 'quiz' | 'mixed';
  blob: Blob;
  downloadedAt: string;
}

class DownloadService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      },
    });
  }

  async saveCourse(course: Omit<OfflineCourse, 'blob' | 'downloadedAt'>, url: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const db = await this.dbPromise;
      await db.put(STORE_NAME, {
        ...course,
        blob,
        downloadedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error saving course for offline:', error);
      return false;
    }
  }

  async getCourse(id: string): Promise<OfflineCourse | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, id);
  }

  async getAllCourses(): Promise<OfflineCourse[]> {
    const db = await this.dbPromise;
    return db.getAll(STORE_NAME);
  }

  async deleteCourse(id: string) {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
  }

  async isDownloaded(id: string): Promise<boolean> {
    const course = await this.getCourse(id);
    return !!course;
  }
}

export const downloadService = new DownloadService();
