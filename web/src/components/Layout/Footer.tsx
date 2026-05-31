// import { Link } from 'react-router-dom';
// import { 
//   BookOpen, Heart, Mail, Phone, MapPin, 
//      Shield, Calendar, Users, Award
// } from 'lucide-react';

// export function Footer() {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="bg-gray-900 text-gray-300 mt-auto">
//       {/* Main Footer */}
//       <div className="container mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
//           {/* Logo y descripción */}
//           <div>
//             <div className="flex items-center gap-2 mb-4">
//               <BookOpen className="h-8 w-8 text-yellow-500" />
//               <span className="text-xl font-bold text-white">UPTAIET</span>
//             </div>
//             <p className="text-sm text-gray-400 mb-4">
//               Catálogo Digital Universitario. Accede a proyectos, libros y recursos académicos 
//               de nuestra comunidad universitaria.
//             </p>
//             <div className="flex gap-3">
//               <a href="#" className="text-gray-400 hover:text-yellow-500 transition">
//                 {/* <Facebook className="h-5 w-5" /> */}
//               </a>
//               <a href="#" className="text-gray-400 hover:text-yellow-500 transition">
//                 {/* <Twitter className="h-5 w-5" /> */}
//               </a>
//               <a href="#" className="text-gray-400 hover:text-yellow-500 transition">
//                 {/* <Instagram className="h-5 w-5" /> */}
//               </a>
            
//             </div>
//           </div>

//           {/* Enlaces rápidos */}
//           <div>
//             <h3 className="text-white font-semibold text-lg mb-4">Enlaces Rápidos</h3>
//             <ul className="space-y-2">
//               <li>
//                 <Link to="/" className="text-gray-400 hover:text-yellow-500 transition text-sm">
//                   Inicio
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/tesis" className="text-gray-400 hover:text-yellow-500 transition text-sm">
//                   Proyectos
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/libros" className="text-gray-400 hover:text-yellow-500 transition text-sm">
//                   Libros
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Contacto */}
//           <div>
//             <h3 className="text-white font-semibold text-lg mb-4">Contacto</h3>
//             <ul className="space-y-3">
//               <li className="flex items-center gap-3 text-sm text-gray-400">
//                 <MapPin className="h-4 w-4 text-yellow-500" />
//                 <span>Caracas, Venezuela</span>
//               </li>
//               <li className="flex items-center gap-3 text-sm text-gray-400">
//                 <Mail className="h-4 w-4 text-yellow-500" />
//                 <a href="mailto:info@uptaiet.edu.ve" className="hover:text-yellow-500">
//                   info@uptaiet.edu.ve
//                 </a>
//               </li>
//               <li className="flex items-center gap-3 text-sm text-gray-400">
//                 <Phone className="h-4 w-4 text-yellow-500" />
//                 <a href="tel:+582123456789" className="hover:text-yellow-500">
//                   +58 212 555-5555
//                 </a>
//               </li>
//             </ul>
//           </div>

//           {/* Estadísticas / Info */}
//           <div>
//             <h3 className="text-white font-semibold text-lg mb-4">Institucional</h3>
//             <ul className="space-y-3">
//               <li className="flex items-center gap-3 text-sm text-gray-400">
//                 <Calendar className="h-4 w-4 text-yellow-500" />
//                 <span>Fundada en 2024</span>
//               </li>
//               <li className="flex items-center gap-3 text-sm text-gray-400">
//                 <Users className="h-4 w-4 text-yellow-500" />
//                 <span>+2,000 estudiantes</span>
//               </li>
//               <li className="flex items-center gap-3 text-sm text-gray-400">
//                 <Award className="h-4 w-4 text-yellow-500" />
//                 <span>Acreditada</span>
//               </li>
//               <li className="flex items-center gap-3 text-sm text-gray-400">
//                 <Shield className="h-4 w-4 text-yellow-500" />
//                 <span>Seguridad y respaldo</span>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Bar */}
//       <div className="border-t border-gray-800">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//             <p className="text-xs text-gray-500">
//               © {currentYear} UPTAIET - Catálogo Digital Universitario. Todos los derechos reservados.
//             </p>
//             <div className="flex gap-6 text-xs">
//               <Link to="/politica-privacidad" className="text-gray-500 hover:text-yellow-500 transition">
//                 Política de privacidad
//               </Link>
//               <Link to="/terminos" className="text-gray-500 hover:text-yellow-500 transition">
//                 Términos y condiciones
//               </Link>
//               <button className="text-gray-500 hover:text-yellow-500 transition flex items-center gap-1">
//                 Hecho con 
//                 <Heart className="h-3 w-3" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

import { Link } from 'react-router-dom';
import {  Heart } from 'lucide-react';
import logo from '../../assets/logo_uptaiet.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cyan-800 text-gray-400 mt-2">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <img src={logo} alt="Logo de UPTAIET" className="h-8 w-8 object-contain" />
            <span className="text-white font-semibold">UPTAIET</span>
            <span className="text-xs">Catálogo Digital</span>
          </div>
          
          <div className="flex gap-6 text-sm">
            <Link to="/" className="hover:text-yellow-500 transition">Inicio</Link>
            <Link to="/tesis" className="hover:text-yellow-500 transition">Proyectos</Link>
            <Link to="/libros" className="hover:text-yellow-500 transition">Libros</Link>
          </div>
          
          <p className="text-xs">
            © {currentYear} UPTAIET. Todos los derechos reservados.
          </p>
          <button className="text-xs text-gray-500 hover:text-yellow-500 transition flex items-center gap-1">
            Hecho con 
                <Heart className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}