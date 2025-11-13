# 📘 ZZIK LIVE Operations Runbook

## 🚨 Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| On-Call Engineer | Pager: #zzik-oncall | 24/7 |
| Platform Lead | Slack: @platform-lead | Business hours |
| Security Team | security@zzik.live | 24/7 |
| Database Admin | Slack: @dba-team | Business hours |

## 🔥 Incident Response

### Severity Levels

- **P0 (Critical)**: Complete service outage, data loss risk
- **P1 (High)**: Major feature broken, significant degradation
- **P2 (Medium)**: Minor feature broken, workaround available
- **P3 (Low)**: Cosmetic issues, minor bugs

### Response Times

| Severity | Response Time | Resolution Time |
|----------|--------------|-----------------|
| P0 | < 5 minutes | < 1 hour |
| P1 | < 15 minutes | < 4 hours |
| P2 | < 1 hour | < 24 hours |
| P3 | < 1 day | Best effort |

## 🔧 Common Issues & Solutions

### 1. High Response Times

**Symptoms:**
- API p95 latency > 500ms
- User reports of slow loading
- k6 alerts firing

**Diagnosis:**
```bash
# Check current load
kubectl top nodes
kubectl top pods -n production

# Check database connections
psql -U zzik -d zzik_live -c "SELECT count(*) FROM pg_stat_activity;"

# Check Redis memory
redis-cli INFO memory
```

**Resolution:**
1. Scale horizontally if CPU > 80%: `kubectl scale deployment web --replicas=5`
2. Clear Redis cache if memory > 80%: `redis-cli FLUSHDB`
3. Check for slow queries: `SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;`

### 2. Database Connection Errors

**Symptoms:**
- "Too many connections" errors
- Prisma connection pool exhausted
- 500 errors from API

**Diagnosis:**
```bash
# Check connection count
psql -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Check for long-running queries
psql -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
         FROM pg_stat_activity 
         WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';"
```

**Resolution:**
1. Kill long-running queries: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE ...;`
2. Restart application pods: `kubectl rollout restart deployment web`
3. Increase connection pool if needed (update DATABASE_URL)

### 3. Map Services Down

**Symptoms:**
- Map tiles not loading
- Location services failing
- Mapbox API errors

**Diagnosis:**
```bash
# Check Mapbox API status
curl -I "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/1/0/0?access_token=$MAPBOX_TOKEN"

# Check our caching layer
redis-cli GET mapbox:health
```

**Resolution:**
1. Verify Mapbox token is valid
2. Check Mapbox status page: https://status.mapbox.com
3. Enable fallback map provider if available
4. Clear map tile cache: `redis-cli DEL mapbox:*`

### 4. QR Verification Failures

**Symptoms:**
- QR codes not scanning
- Verification endpoint returning 500
- Users unable to redeem offers

**Diagnosis:**
```bash
# Check QR service health
curl http://localhost:3000/api/qr/health

# Check database for QR records
psql -c "SELECT COUNT(*) FROM qr_codes WHERE created_at > NOW() - INTERVAL '1 hour';"

# Check logs for errors
kubectl logs -n production -l app=web --tail=100 | grep -i "qr"
```

**Resolution:**
1. Restart QR worker: `kubectl delete pod -l app=qr-worker`
2. Clear QR cache: `redis-cli DEL qr:*`
3. Verify JWT signing keys are present
4. Check rate limits aren't being hit

### 5. Memory Leaks

**Symptoms:**
- Gradually increasing memory usage
- Node.js OOM errors
- Container restarts

**Diagnosis:**
```bash
# Generate heap snapshot
kubectl exec -it web-pod-xxx -- kill -USR2 1

# Check memory metrics
kubectl top pod web-pod-xxx --containers

# Review memory timeline
kubectl logs web-pod-xxx | grep -i memory
```

**Resolution:**
1. Immediate: Restart affected pods
2. Investigate: Analyze heap dumps
3. Fix: Deploy patch with memory leak fix
4. Monitor: Set up memory alerts

## 📊 Monitoring & Alerts

### Key Metrics to Watch

| Metric | Warning Threshold | Critical Threshold | Dashboard |
|--------|------------------|-------------------|-----------|
| API p95 latency | > 200ms | > 500ms | [Link] |
| Error rate | > 1% | > 5% | [Link] |
| Database connections | > 80 | > 95 | [Link] |
| Memory usage | > 70% | > 90% | [Link] |
| QR scan success rate | < 95% | < 90% | [Link] |

### Alert Runbook Links

- [High Latency Alert](./alerts/high-latency.md)
- [Database Alert](./alerts/database.md)
- [Security Alert](./alerts/security.md)
- [Rate Limit Alert](./alerts/rate-limit.md)

## 🔄 Deployment Procedures

### Rolling Deployment

```bash
# 1. Verify health
npm run doctor

# 2. Run tests
npm run test:unit && npm run test:e2e

# 3. Build and verify
npm run build
npm run headers:verify

# 4. Deploy to staging
kubectl apply -f k8s/staging/

# 5. Run smoke tests
npm run k6:smoke -- --env ENVIRONMENT=staging

# 6. Deploy to production
kubectl apply -f k8s/production/

# 7. Monitor metrics
watch kubectl get pods -n production
```

### Rollback Procedure

```bash
# 1. Identify last working version
kubectl rollout history deployment/web

# 2. Rollback
kubectl rollout undo deployment/web --to-revision=<number>

# 3. Verify
kubectl rollout status deployment/web

# 4. Run health checks
curl http://app.zzik.live/api/health
```

## 🔐 Security Incidents

### Suspected Data Breach

1. **Immediate Actions:**
   - Rotate all API keys and secrets
   - Enable read-only mode
   - Capture audit logs

2. **Investigation:**
   - Review access logs
   - Check for unauthorized API calls
   - Analyze geohash5 privacy compliance

3. **Communication:**
   - Notify security team
   - Prepare incident report
   - Customer communication if needed

### Rate Limit Abuse

1. **Identify source:** `grep "X-RateLimit-Limit" /var/log/nginx/access.log | sort | uniq -c`
2. **Block if malicious:** Add to IP blacklist
3. **Adjust limits if legitimate:** Update rate limit configuration

## 🗄️ Database Maintenance

### Backup Verification

```bash
# Daily backup check
pg_dump -U zzik zzik_live > backup_$(date +%Y%m%d).sql
gzip backup_*.sql

# Verify backup
gunzip -c backup_*.sql.gz | head -100
```

### Index Optimization

```sql
-- Check missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
AND correlation < 0.1
ORDER BY n_distinct DESC;

-- Rebuild indexes
REINDEX DATABASE zzik_live;
```

## 📈 Performance Tuning

### Query Optimization

```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Analyze query plan
EXPLAIN ANALYZE <query>;
```

### Cache Optimization

```bash
# Redis memory analysis
redis-cli --bigkeys

# Clear specific cache patterns
redis-cli --scan --pattern "offers:*" | xargs redis-cli DEL
```

## 🧪 Testing in Production

### Smoke Tests

```bash
# Run minimal smoke test
k6 run k6/api-smoke.js --env ENVIRONMENT=production

# Full integration test (off-peak only)
npm run test:integration -- --env production
```

### Synthetic Monitoring

- Mapbox tile loading: Every 5 minutes
- QR code verification: Every 10 minutes
- Wallet operations: Every 15 minutes
- Search functionality: Every 5 minutes

## 📝 Post-Incident Review

### Template

1. **Incident Summary**
   - Start/End time
   - Severity
   - Impact (users affected, data loss)

2. **Root Cause**
   - Technical details
   - Why it wasn't caught earlier

3. **Timeline**
   - Detection
   - Response
   - Resolution

4. **Action Items**
   - Immediate fixes
   - Long-term improvements
   - Process changes

5. **Metrics**
   - MTTR (Mean Time To Recovery)
   - Customer impact
   - SLA compliance

---

**Remember:** 
- 🎯 Focus on user impact first
- 📊 Document everything
- 🔄 Communicate status updates every 15 minutes during P0/P1
- 🧪 Test fixes in staging first (unless P0)
- 📈 Always conduct post-incident review