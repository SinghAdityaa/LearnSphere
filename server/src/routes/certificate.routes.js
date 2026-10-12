import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { requireAuth } from '../middleware/auth.js';
import Certificate from '../models/Certificate.js';

const router = Router();
router.get('/verify/:certificateId', async(req,res,next)=>{try{const c=await Certificate.findOne({certificateId:req.params.certificateId}).populate('course','title').populate('user','name');if(!c||!c.course||!c.user)return res.status(404).json({valid:false});res.json({valid:true,certificateId:c.certificateId,student:c.user.name,course:c.course.title,issuedAt:c.issuedAt});}catch(e){next(e)}});
router.use(requireAuth);

router.get('/:id', async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ _id: req.params.id, user: req.user._id }).populate('course', 'title').populate('user', 'name');
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
    res.json({ certificate });
  } catch (error) { next(error); }
});

router.get('/:id/pdf', async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ _id: req.params.id, user: req.user._id }).populate('course', 'title').populate('user', 'name');
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.certificateId}.pdf"`);
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    doc.pipe(res);
    doc.rect(30, 30, 782, 535).lineWidth(3).stroke('#0f4c81');
    doc.fontSize(16).fillColor('#0f4c81').text('LEARNSPHERE', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(34).fillColor('#111827').text('Certificate of Completion', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(16).fillColor('#4b5563').text('This certifies that', { align: 'center' });
    doc.moveDown(.6);
    doc.fontSize(28).fillColor('#111827').text(certificate.user.name, { align: 'center' });
    doc.moveDown(.6);
    doc.fontSize(16).fillColor('#4b5563').text('has successfully completed', { align: 'center' });
    doc.moveDown(.6);
    doc.fontSize(24).fillColor('#0f4c81').text(certificate.course.title, { align: 'center' });
    doc.moveDown(1.2);
    doc.fontSize(11).fillColor('#6b7280').text(`Certificate ID: ${certificate.certificateId}`, { align: 'center' });
    doc.text(`Issued: ${new Date(certificate.issuedAt).toLocaleDateString('en-IN')}`, { align: 'center' });
    doc.end();
  } catch (error) { next(error); }
});

export default router;
