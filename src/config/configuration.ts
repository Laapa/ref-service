export interface AppConfig {
  port: number;
  nodeEnv: string;
}

export interface DatabaseConfig {
  mongodb: {
    uri: string;
    dbName: string;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
  retryAttempts: number;
  retryDelay: number;
  timeoutMs: number;
  replyTimeoutMs: number;
}

export interface ReferralConfig {
  commissionRate: number;
  baseCommissionRate: number;
  linkExpirationDays: number;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  kafka: KafkaConfig;
  referral: ReferralConfig;
}

export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3004', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_DB_NAME || 'referral_service',
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    clientId: process.env.KAFKA_CLIENT_ID || 'referral-service',
    groupId: process.env.KAFKA_GROUP_ID || 'referral-service-consumer',
    retryAttempts: parseInt(process.env.KAFKA_RETRY_ATTEMPTS || '5', 10),
    retryDelay: parseInt(process.env.KAFKA_RETRY_DELAY || '1000', 10),
    timeoutMs: parseInt(process.env.KAFKA_TIMEOUT_MS || '30000', 10),
    replyTimeoutMs: parseInt(process.env.KAFKA_REPLY_TIMEOUT_MS || '5000', 10),
  },

  referral: {
    commissionRate: parseFloat(process.env.REFERRAL_COMMISSION_RATE || '0.015'), // 1.5%
    baseCommissionRate: parseFloat(process.env.BASE_COMMISSION_RATE || '0.05'), // 5%
    linkExpirationDays: parseInt(process.env.LINK_EXPIRATION_DAYS || '30', 10),
  },
});
