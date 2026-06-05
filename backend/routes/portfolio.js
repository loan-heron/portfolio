import express from 'express';
import portfolioData from '../controllers/portfolioController.js';

const router = express.Router();

// ===== GET all portfolio data =====
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: portfolioData
    });
});

// ===== GET person info =====
router.get('/person', (req, res) => {
    res.json({
        success: true,
        data: portfolioData.person
    });
});

// ===== GET skills =====
router.get('/skills', (req, res) => {
    res.json({
        success: true,
        data: portfolioData.skills
    });
});

// ===== GET all projects =====
router.get('/projects', (req, res) => {
    res.json({
        success: true,
        data: portfolioData.projects
    });
});

// ===== GET single project =====
router.get('/projects/:id', (req, res) => {
    const project = portfolioData.projects.find(p => p.id === parseInt(req.params.id));
    if (!project) {
        return res.status(404).json({
            success: false,
            message: 'Projet non trouvé'
        });
    }
    res.json({
        success: true,
        data: project
    });
});

// ===== GET experience =====
router.get('/experience', (req, res) => {
    res.json({
        success: true,
        data: portfolioData.experience
    });
});

export default router;
