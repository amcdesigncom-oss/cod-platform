const express = require('express');
const LandingPage = require('../models/LandingPage');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

const ALGERIAN_WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira',
  'Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda',
  'Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M\'Sila','Mascara',
  'Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf',
  'Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah',
  'In Guezzam','Touggourt','Djanet','El M\'Ghair','El Meniaa'
];

router.get('/wilayas', (req, res) => res.json(ALGERIAN_WILAYAS));

router.post('/generate', auth, adminOnly, async (req, res) => {
  try {
    const { productId, config } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    
    const discount = product.oldPrice ? Math.round((1 - product.price/product.oldPrice)*100) : 30;
    const slug = `${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    
    const landingPage = new LandingPage({
      product: productId,
      slug,
      title: product.name,
      config: {
        style: config?.style || 'modern',
        primaryColor: config?.color || '#6366f1',
        offerText: config?.offer || '🚚 Livraison Gratuite + Paiement à la Livraison'
      },
      generatedContent: {
        headline: `Découvrez les ${product.name} - L'Élégance Redéfinie`,
        subheadline: product.description.substring(0, 120) + '...',
        benefits: [
          '✓ Livraison gratuite partout en Algérie',
          '✓ Paiement à la livraison (COD)',
          '✓ Garantie satisfait ou remboursé 7 jours',
          '✓ Qualité premium garantie',
          '✓ Service client disponible 7j/7'
        ],
        testimonials: [
          { name: 'Ahmed K.', text: 'Produit excellent, livraison rapide à Alger!', rating: 5, wilaya: 'Alger' },
          { name: 'Fatima Z.', text: 'Je recommande, très bon rapport qualité-prix.', rating: 5, wilaya: 'Oran' },
          { name: 'Karim B.', text: 'Livraison en 24h, paiement à la livraison parfait.', rating: 4, wilaya: 'Constantine' }
        ],
        faq: [
          { question: 'Comment se passe la livraison ?', answer: 'Nous livrons partout en Algérie. Vous payez à la réception.' },
          { question: 'Puis-je retourner le produit ?', answer: 'Oui, vous avez 7 jours pour retourner le produit.' },
          { question: 'Quel est le délai de livraison ?', answer: 'Généralement 24 à 48 heures selon votre wilaya.' }
        ],
        urgencyText: '🔥 Plus que 3 unités disponibles à ce prix!'
      }
    });
    
    await landingPage.save();
    res.status(201).json({ message: 'Landing page générée', landingPage });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/', auth, adminOnly, async (req, res) => {
  const pages = await LandingPage.find().populate('product', 'name price').sort({ createdAt: -1 });
  res.json(pages);
});

// PUBLIC - Afficher la landing page HTML
router.get('/preview/:slug', async (req, res) => {
  try {
    const landing = await LandingPage.findOne({ slug: req.params.slug }).populate('product');
    if (!landing) return res.status(404).send('Page non trouvée');
    
    landing.views++;
    await landing.save();
    
    const { product, config, generatedContent } = landing;
    const discount = product.oldPrice ? Math.round((1 - product.price/product.oldPrice)*100) : 30;
    
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${product.name} | Livraison Gratuite Algérie</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b}
.container{max-width:480px;margin:0 auto;background:#fff;min-height:100vh}
.hero{background:linear-gradient(135deg,${config.primaryColor},#8b5cf6);padding:40px 24px;text-align:center;color:#fff}
.badge{display:inline-block;background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:16px}
.product-img{width:180px;height:180px;background:rgba(255,255,255,0.15);border-radius:24px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;font-size:80px}
.title{font-size:26px;font-weight:800;margin-bottom:8px}
.price{font-size:36px;font-weight:800}.old-price{text-decoration:line-through;opacity:0.7;font-size:20px;margin-left:12px}
.discount{background:#ef4444;color:#fff;padding:4px 12px;border-radius:20px;font-size:14px;font-weight:700;margin-left:12px}
.offer-bar{background:rgba(255,255,255,0.15);padding:12px;border-radius:12px;margin-top:16px;font-weight:600;font-size:14px}
.section{padding:32px 24px}.section-title{font-size:20px;font-weight:700;margin-bottom:20px;text-align:center}
.benefit{display:flex;align-items:center;gap:12px;padding:14px;background:#f1f5f9;border-radius:12px;margin-bottom:10px;font-size:14px}
.testimonial{background:#f8fafc;padding:20px;border-radius:16px;margin-bottom:12px}
.stars{color:#fbbf24;margin-bottom:8px}.testimonial-text{font-size:14px;color:#475569;margin-bottom:8px}
.testimonial-author{font-weight:600;font-size:13px;color:#64748b}
.urgency{background:linear-gradient(135deg,#fef3c7,#fde68a);padding:20px;border-radius:16px;text-align:center;margin:20px 0;border:2px solid #f59e0b}
.urgency-text{font-weight:700;color:#92400e;font-size:16px}
.countdown{font-size:32px;font-weight:800;color:#dc2626;margin-top:8px}
.form-section{background:linear-gradient(180deg,#f8fafc,#fff);padding:32px 24px}
.form-title{font-size:22px;font-weight:700;text-align:center;margin-bottom:8px}
.form-subtitle{text-align:center;color:#64748b;font-size:14px;margin-bottom:24px}
.form-group{margin-bottom:14px}
.form-label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px}
.form-input{width:100%;padding:14px 16px;border:2px solid #e5e7eb;border-radius:12px;font-size:15px;outline:none}
.form-input:focus{border-color:${config.primaryColor};box-shadow:0 0 0 3px ${config.primaryColor}33}
.form-select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;background-size:20px}
.submit-btn{width:100%;padding:16px;background:linear-gradient(135deg,${config.primaryColor},#8b5cf6);color:#fff;border:none;border-radius:14px;font-size:18px;font-weight:700;cursor:pointer}
.trust-badges{display:flex;justify-content:center;gap:20px;margin-top:16px;font-size:12px;color:#6b7280}
.faq-item{border-bottom:1px solid #e5e7eb;padding:16px 0}
.faq-question{font-weight:600;color:#1e293b;margin-bottom:8px}
.faq-answer{color:#64748b;font-size:14px}
.footer{background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:12px}
.success-modal{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center}
.success-modal.active{display:flex}
.modal-content{background:#fff;padding:40px;border-radius:24px;text-align:center;max-width:400px;margin:20px}
.modal-icon{font-size:64px;margin-bottom:16px}
.modal-title{font-size:24px;font-weight:700;margin-bottom:8px}
.modal-text{color:#64748b;margin-bottom:24px}
.modal-btn{padding:12px 32px;background:${config.primaryColor};color:#fff;border:none;border-radius:12px;font-weight:600;cursor:pointer}
</style>
</head>
<body>
<div class="container">
<div class="hero">
<div class="badge">🔥 OFFRE EXCLUSIVE</div>
<div class="product-img">${product.images?.[0] || '👕'}</div>
<h1 class="title">${generatedContent.headline}</h1>
<p style="font-size:16px;opacity:0.9;margin-bottom:20px">${generatedContent.subheadline}</p>
<div><span class="price">${product.price.toLocaleString()} DA</span>${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} DA</span><span class="discount">-${discount}%</span>` : ''}</div>
<div class="offer-bar">${config.offerText}</div>
</div>

<div class="section">
<h2 class="section-title">✅ Pourquoi choisir ce produit ?</h2>
${generatedContent.benefits.map(b => `<div class="benefit"><span style="font-size:20px">${b.split(' ')[0]}</span><span>${b.substring(2)}</span></div>`).join('')}
</div>

<div class="section" style="background:#f8fafc">
<h2 class="section-title">💬 Avis de nos clients</h2>
${generatedContent.testimonials.map(t => `<div class="testimonial"><div class="stars">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div><div class="testimonial-text">"${t.text}"</div><div class="testimonial-author">${t.name} — ${t.wilaya}</div></div>`).join('')}
</div>

<div class="section"><div class="urgency"><div class="urgency-text">${generatedContent.urgencyText}</div><div class="countdown" id="countdown">02:45:12</div></div></div>

<div class="section" style="background:#f8fafc">
<h2 class="section-title">❓ Questions Fréquentes</h2>
${generatedContent.faq.map(f => `<div class="faq-item"><div class="faq-question">${f.question}</div><div class="faq-answer">${f.answer}</div></div>`).join('')}
</div>

<div class="form-section" id="commander">
<h2 class="form-title">🛒 Commander Maintenant</h2>
<p class="form-subtitle">Remplissez le formulaire, nous vous appelons pour confirmer</p>
<form id="orderForm">
<div class="form-group"><label class="form-label">Nom *</label><input type="text" class="form-input" name="lastName" placeholder="Votre nom" required></div>
<div class="form-group"><label class="form-label">Prénom *</label><input type="text" class="form-input" name="firstName" placeholder="Votre prénom" required></div>
<div class="form-group"><label class="form-label">Téléphone *</label><input type="tel" class="form-input" name="phone" placeholder="05XX XX XX XX" required></div>
<div class="form-group"><label class="form-label">Wilaya *</label><select class="form-input form-select" name="wilaya" required><option value="">Sélectionner...</option>${ALGERIAN_WILAYAS.map(w => `<option value="${w}">${w}</option>`).join('')}</select></div>
<div class="form-group"><label class="form-label">Commune *</label><input type="text" class="form-input" name="commune" placeholder="Votre commune" required></div>
<div class="form-group"><label class="form-label">Quantité</label><select class="form-input form-select" name="quantity"><option value="1">1 unité — ${product.price.toLocaleString()} DA</option><option value="2">2 unités — ${(product.price*2*0.9).toLocaleString()} DA (-10%)</option><option value="3">3 unités — ${(product.price*3*0.85).toLocaleString()} DA (-15%)</option></select></div>
<button type="submit" class="submit-btn">📞 Confirmer ma Commande</button>
<div class="trust-badges"><span>🔒 Paiement sécurisé</span><span>📦 Livraison rapide</span><span>✓ Satisfait/remboursé</span></div>
</form>
</div>

<div class="footer">© 2026 - Tous droits réservés<br>Livraison partout en Algérie | Paiement à la livraison</div>
</div>

<div class="success-modal" id="successModal"><div class="modal-content"><div class="modal-icon">🎉</div><div class="modal-title">Commande Reçue !</div><div class="modal-text">Notre équipe vous contactera bientôt pour confirmer.</div><button class="modal-btn" onclick="closeModal()">Parfait !</button></div></div>

<script>
let time=2*3600+45*60+12;
setInterval(()=>{time--;const h=Math.floor(time/3600).toString().padStart(2,'0');const m=Math.floor((time%3600)/60).toString().padStart(2,'0');const s=(time%60).toString().padStart(2,'0');document.getElementById('countdown').textContent=h+':'+m+':'+s;},1000);
document.getElementById('orderForm').addEventListener('submit',async(e)=>{e.preventDefault();const fd=new FormData(e.target);const data=Object.fromEntries(fd);data.productId='${product._id}';try{const res=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const r=await res.json();if(res.ok){document.getElementById('successModal').classList.add('active');e.target.reset()}else{alert(r.message||'Erreur')}}catch(err){alert('Erreur réseau')}});
function closeModal(){document.getElementById('successModal').classList.remove('active')}
</script>
</body>
</html>`;
    
    res.send(html);
  } catch (error) {
    res.status(500).send('Erreur');
  }
});

module.exports = router;