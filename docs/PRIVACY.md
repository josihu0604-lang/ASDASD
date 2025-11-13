# 🔐 ZZIK LIVE Privacy & Data Protection Guide

## Core Privacy Principle: Geohash5 Only

**NEVER store, log, or transmit raw latitude/longitude coordinates.** All location data must be converted to geohash5 format for privacy protection.

## 🌍 Location Data Handling

### ✅ Allowed (Geohash5)
```typescript
// CORRECT: Using geohash5
const userLocation = {
  geohash: 'u4pru',  // ~4.9km precision
  timestamp: Date.now(),
  accuracy: 'city_district'
};

// CORRECT: Logging with geohash
logger.info('User location updated', {
  userId: user.id,
  geohash: geohash.encode(lat, lng, 5),  // Convert immediately
  event: 'location_update'
});
```

### ❌ Prohibited (Raw Coordinates)
```typescript
// WRONG: Never store raw coordinates
const userLocation = {
  lat: 35.6762,    // ❌ PROHIBITED
  lng: 139.6503,   // ❌ PROHIBITED
  timestamp: Date.now()
};

// WRONG: Never log raw coordinates
console.log(`User at ${lat}, ${lng}`);  // ❌ PROHIBITED
```

## 🛡️ Privacy Implementation Checklist

### 1. Data Collection
- [ ] Obtain explicit consent for location access
- [ ] Convert coordinates to geohash5 immediately upon receipt
- [ ] Never store raw coordinates in any form
- [ ] Implement data minimization (collect only what's needed)

### 2. Data Storage
- [ ] Store only geohash5 in database
- [ ] Encrypt sensitive data at rest
- [ ] Implement automatic data expiration
- [ ] Regular privacy audits of stored data

### 3. Data Transmission
- [ ] Always use HTTPS/TLS
- [ ] Send only geohash5 in API requests/responses
- [ ] Implement end-to-end encryption for sensitive data
- [ ] Rate limiting on all endpoints

### 4. Logging & Monitoring
- [ ] Configure structured logging to exclude raw coordinates
- [ ] Audit logs regularly for privacy violations
- [ ] Alert on any raw coordinate detection
- [ ] Sanitize error messages

## 📊 Geohash Precision Levels

| Level | Cell Size | Privacy Level | Use Case |
|-------|-----------|---------------|----------|
| 1 | ~5,000km | Continent | Analytics only |
| 2 | ~1,250km | Country | Regional stats |
| 3 | ~156km | State | Broad targeting |
| 4 | ~39km | City | City-level features |
| **5** | **~4.9km** | **District (ZZIK Default)** | **Offers, discovery** |
| 6 | ~1.2km | Neighborhood | Never use |
| 7+ | <1km | Street level | Prohibited |

## 🔍 Privacy-Preserving Features

### Offer Discovery
```typescript
// Find offers near user without exposing exact location
export async function findNearbyOffers(userGeohash: string) {
  // Get neighboring geohashes for search
  const searchArea = geohash.neighbors(userGeohash);
  searchArea.push(userGeohash);
  
  return await prisma.offer.findMany({
    where: {
      geohash: { in: searchArea },
      active: true
    }
  });
}
```

### Anonymous Analytics
```typescript
// Aggregate data at geohash level
export async function getLocationStats() {
  return await prisma.$queryRaw`
    SELECT 
      geohash,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(*) as total_events
    FROM events
    WHERE geohash IS NOT NULL
    GROUP BY geohash
    HAVING COUNT(DISTINCT user_id) >= 10  -- K-anonymity threshold
  `;
}
```

## 🚫 Anti-Patterns to Avoid

### 1. Client-Side Storage
```javascript
// ❌ WRONG: Never store in localStorage
localStorage.setItem('userLat', position.coords.latitude);

// ✅ CORRECT: Store geohash only
localStorage.setItem('userGeohash', geohash.encode(
  position.coords.latitude,
  position.coords.longitude,
  5
));
```

### 2. URL Parameters
```typescript
// ❌ WRONG: Coordinates in URL
router.push(`/map?lat=${lat}&lng=${lng}`);

// ✅ CORRECT: Geohash in URL
router.push(`/map?area=${geohash}`);
```

### 3. Error Messages
```typescript
// ❌ WRONG: Exposing location in errors
throw new Error(`Invalid location: ${lat}, ${lng}`);

// ✅ CORRECT: Generic error messages
throw new Error('Invalid location data');
```

## 🔧 Implementation Tools

### Geohash Utilities
```typescript
// lib/privacy/geohash.ts
import * as ngeohash from 'ngeohash';

export class PrivacyGuard {
  static readonly PRECISION = 5;  // District level
  
  static encode(lat: number, lng: number): string {
    return ngeohash.encode(lat, lng, this.PRECISION);
  }
  
  static decode(geohash: string): { lat: number; lng: number } {
    // Returns center point of geohash cell
    return ngeohash.decode(geohash);
  }
  
  static bounds(geohash: string) {
    // Returns bounding box of geohash cell
    return ngeohash.decode_bbox(geohash);
  }
  
  static neighbors(geohash: string): string[] {
    // Returns 8 neighboring cells
    return ngeohash.neighbors(geohash);
  }
}
```

### Runtime Validation
```typescript
// middleware/privacy.ts
export function validateNoRawCoordinates(req: Request) {
  const suspicious = [
    'lat', 'latitude', 'lng', 'longitude',
    'coord', 'location.lat', 'location.lng'
  ];
  
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);
  
  for (const term of suspicious) {
    if (body.includes(term) || query.includes(term)) {
      logger.warn('Potential raw coordinate detected', {
        path: req.path,
        method: req.method,
        term
      });
      
      // In production, reject the request
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid location format');
      }
    }
  }
}
```

## 📝 GDPR/CCPA Compliance

### User Rights Implementation

1. **Right to Access**
```typescript
export async function exportUserData(userId: string) {
  const data = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      events: true,
      offers: true,
      wallet: true
    }
  });
  
  // Ensure no raw coordinates in export
  return sanitizeUserData(data);
}
```

2. **Right to Delete**
```typescript
export async function deleteUserData(userId: string) {
  // Soft delete with data anonymization
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: `deleted-${userId}@anonymous.local`,
      name: 'Deleted User',
      geohash: null,  // Remove location
      deletedAt: new Date()
    }
  });
}
```

3. **Right to Portability**
```typescript
export async function generateDataExport(userId: string) {
  const data = await exportUserData(userId);
  return {
    format: 'json',
    timestamp: new Date().toISOString(),
    data: data,
    // Include only geohash, never raw coordinates
    location_precision: 'geohash5 (~5km)'
  };
}
```

## 🎯 Privacy Testing

### Unit Tests
```typescript
describe('Privacy Compliance', () => {
  it('should never expose raw coordinates in API', async () => {
    const response = await request(app)
      .get('/api/offers/nearby')
      .query({ geohash: 'u4pru' });
    
    const body = JSON.stringify(response.body);
    expect(body).not.toMatch(/\d+\.\d{4,}/);  // No precise decimals
    expect(body).not.toContain('lat');
    expect(body).not.toContain('lng');
  });
  
  it('should convert coordinates to geohash immediately', () => {
    const lat = 35.6762;
    const lng = 139.6503;
    const result = processLocation(lat, lng);
    
    expect(result).toHaveProperty('geohash');
    expect(result.geohash).toHaveLength(5);
    expect(result).not.toHaveProperty('lat');
    expect(result).not.toHaveProperty('lng');
  });
});
```

### E2E Privacy Audit
```typescript
// Run regularly to ensure compliance
export async function privacyAudit() {
  const violations = [];
  
  // Check database schema
  const tables = await prisma.$queryRaw`
    SELECT column_name, table_name 
    FROM information_schema.columns 
    WHERE column_name SIMILAR TO '%(lat|lng|latitude|longitude)%'
  `;
  
  if (tables.length > 0) {
    violations.push({
      type: 'SCHEMA_VIOLATION',
      details: 'Raw coordinate columns found in database',
      tables
    });
  }
  
  // Check recent logs
  const logs = await readRecentLogs();
  const coordPattern = /\d{1,3}\.\d{4,}/g;
  
  logs.forEach(log => {
    if (coordPattern.test(log)) {
      violations.push({
        type: 'LOG_VIOLATION',
        details: 'Potential coordinates in logs',
        sample: log.substring(0, 100)
      });
    }
  });
  
  return violations;
}
```

## 🚨 Incident Response

If raw coordinates are accidentally exposed:

1. **Immediate Actions**
   - Rotate affected API keys
   - Clear logs containing raw data
   - Deploy hotfix to prevent further exposure

2. **Assessment**
   - Identify scope of exposure
   - Determine affected users
   - Review access logs

3. **Remediation**
   - Update affected records to geohash5
   - Implement additional validation
   - Enhance monitoring

4. **Communication**
   - Notify affected users if required
   - Update privacy policy if needed
   - Document lessons learned

## 📚 Additional Resources

- [Geohash Algorithm](http://geohash.org/)
- [GDPR Location Data Guidelines](https://gdpr.eu/eu-gdpr-personal-data/)
- [Privacy by Design Framework](https://www.ipc.on.ca/wp-content/uploads/resources/7foundationalprinciples.pdf)
- [OWASP Privacy Guidelines](https://owasp.org/www-project-top-10-privacy-risks/)

---

**Remember:** Privacy is not optional. Every team member is responsible for maintaining user privacy. When in doubt, always choose the more private option.