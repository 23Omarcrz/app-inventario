export class AdminController {
    constructor({ adminModel }) {
        this.adminModel = adminModel;
    }

    getUsers = async(req, res) => {
        // /admin?id=6sdfsljk
        try {
            let { id_admin } = req.query;
            id_admin = Number(id_admin);
    
            const users = await this.adminModel.getUsers({ id_admin });
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ message: "Ocurrió un error interno, intenta más tarde" });
        }
        // que es lo que renderiza
        //res.json(users);
    } 
}