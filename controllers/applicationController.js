const Application = require('../models/Application');

exports.createApplication = async (req, res) => {
    try {
        const application = new Application(req.body);
        await application.save();
        res.status(201).json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('candidateId jobId companyId');
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('candidateId jobId companyId');
        if (!application) return res.status(404).json({ error: 'Application not found' });
        res.json(application);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateApplication = async (req, res) => {
    try {
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!application) return res.status(404).json({ error: 'Application not found' });
        res.json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id);
        if (!application) return res.status(404).json({ error: 'Application not found' });
        res.json({ message: 'Application deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addMessage = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ error: 'Application not found' });

        application.messages.push({
            sender: req.body.sender,
            message: req.body.message
        });

        await application.save();
        res.json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const validStatuses = ['applied', 'reviewing', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];
        if (!validStatuses.includes(req.body.status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!application) return res.status(404).json({ error: 'Application not found' });
        res.json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
