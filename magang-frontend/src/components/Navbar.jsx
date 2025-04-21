import logo from "../assets/images/logo.png";

const Navbar = () => {
  return (
    <nav className="bg-stone-500 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center">
        <img src={logo} alt="DISKOMINFO Logo" className="h-12 mr-3" />
        <div>
          <h1 className="text-xl font-bold">DISKOMINFO</h1>
          <p className="text-sm">Daerah Istimewa Yogyakarta</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
