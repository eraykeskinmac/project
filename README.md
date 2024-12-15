# Bookstore Management API

## Kurulum ve Çalıştırma

### Docker ile Çalıştırma

```bash
# Projeyi çalıştırma
docker-compose up -d

# Logları görüntüleme
docker-compose logs -f

# Containerları durdurma
docker-compose down

# Containerları ve volumeleri temizleme
docker-compose down -v
```

### Swagger UI Erişim

[Swagger UI](http://localhost:3000/api)

1. Swagger UI üzerinden login endpoint'i ile giriş yapın
2. Aldığınız token'ı sağ üstteki "Authorize" butonuna tıklayarak ekleyin
3. Diğer endpoint'leri test etmeye başlayabilirsiniz

### Default Admin Kullanıcısı

```json
{
  "email": "admin@bookstore.com",
  "password": "admin123"
}
```

## Roller ve Yetkiler

- **Admin**: Tüm işlemleri yapabilir
- **Store Manager**: Mağaza stok yönetimini yapabilir (kitap ekleme/çıkarma)
- **User**: Sadece görüntüleme yetkisine sahiptir

## Notlar

- JWT token'ı otomatik olarak container başlatıldığında oluşturulur
- Default admin kullanıcısı ilk çalıştırmada otomatik oluşturulur
- Veritabanı PostgreSQL container'ında persist edilir

## Özellikler

### Exception Handling
- Custom exception sınıfları (NotFound, DuplicateEntry, InsufficientStock vb.)
- Global exception filter ile merkezi hata yönetimi
- Detaylı hata mesajları ve HTTP durum kodları
- Validation pipe ile input doğrulama

### Logging Sistemi
- Winston logger implementasyonu
- Farklı log seviyeleri (error, info, warn, debug)
- Günlük rotasyonlu log dosyaları
  - Application logs: /logs/application-YYYY-MM-DD.log
  - Error logs: /logs/error-YYYY-MM-DD.log
- Yapılandırılmış log formatı (JSON)
- Request/response loglama
- Exception loglama

### Log Dosyaları

```bash
# Application loglarını görüntüleme
tail -f logs/application-YYYY-MM-DD.log

# Error loglarını görüntüleme
tail -f logs/error-YYYY-MM-DD.log
```

### Exception Örnekleri

```bash
# Not Found Exception Test
curl -X GET http://localhost:3000/bookstores/999 \
-H "Authorization: Bearer YOUR_JWT_TOKEN"

# Validation Error Test
curl -X POST http://localhost:3000/books \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "",
  "author": "",
  "isbn": "invalid-isbn",
  "price": -29.99
}'
```

## API Endpoints

### Auth

| Method | Endpoint        | Açıklama       | Rol   |
|--------|-----------------|----------------|-------|
| POST   | /auth/login     | Giriş          | Hepsi |
| POST   | /auth/register  | Kullanıcı kaydı| Admin |

### Books

| Method | Endpoint        | Açıklama       | Rol   |
|--------|-----------------|----------------|-------|
| GET    | /books          | Kitap listesi  | Hepsi |
| POST   | /books          | Kitap ekleme   | Admin |
| GET    | /books/:id      | Kitap detayı   | Hepsi |
| PUT    | /books/:id      | Kitap güncelleme | Admin |
| DELETE | /books/:id      | Kitap silme    | Admin |

### Bookstores

| Method | Endpoint                      | Açıklama         | Rol             |
|--------|-------------------------------|------------------|-----------------|
| GET    | /bookstores                   | Mağaza listesi   | Hepsi           |
| POST   | /bookstores                   | Mağaza ekleme    | Admin           |
| GET    | /bookstores/:id               | Mağaza detayı    | Hepsi           |
| PUT    | /bookstores/:id               | Mağaza güncelleme| Admin           |
| POST   | /bookstores/:id/books/:bookId | Kitap ekleme     | Admin, Manager  |
| DELETE | /bookstores/:id/books/:bookId | Kitap çıkarma    | Admin, Manager  |
| GET    | /bookstores/:id/books/:bookId/quantity | Stok kontrolü | Hepsi |

## Environment Variables (.env)

```env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=bookstore_db
JWT_SECRET=your_jwt_secret
```

## Test İstekleri

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@bookstore.com",
  "password": "admin123"
}'
```

### Mağaza Ekleme

```bash
curl -X POST http://localhost:3000/bookstores \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Downtown Books",
  "address": "123 Main St"
}'
```

### Kitap Ekleme

```bash
curl -X POST http://localhost:3000/books \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "price": 44.99
}'
```

### Mağazaya Kitap Ekleme

```bash
curl -X POST http://localhost:3000/bookstores/1/books/1 \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "quantity": 10
}'
```
