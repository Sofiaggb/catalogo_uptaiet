// // app/(tabs)/tesis/[id].tsx
// import { useLocalSearchParams } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
// import { getTesisById } from '../../services/api';

// export default function TesisDetailScreen() {
//   const { id } = useLocalSearchParams();
//   const [tesis, setTesis] = useState(null);

//   useEffect(() => {
//     cargarTesis();
//   }, []);

//   const cargarTesis = async () => {
//     const data = await getTesisById(id);
//     setTesis(data);
//   };

//   if (!tesis) return <View><Text>Cargando...</Text></View>;

//   return (
//     <ScrollView className="flex-1 bg-white">
//       <View className="bg-yellow-500 pt-12 pb-6 px-5">
//         <Text className="text-black text-2xl font-bold">{tesis.titulo}</Text>
//         <View className="bg-black rounded-full px-3 py-1 mt-3 self-start">
//           <Text className="text-yellow-500 text-xs">{tesis.carrera?.nombre}</Text>
//         </View>
//       </View>

//       <View className="p-5">
//         <DetailSection title="Autores" content={tesis.estudiantes?.map(e => e.nombre_completo).join(', ')} />
//         <DetailSection title="Resumen" content={tesis.resumen} />
//         <DetailSection title="Calificación" content={`${tesis.promedio_nota || 'Pendiente'}/20`} />
        
//         <TouchableOpacity className="bg-black rounded-xl p-4 mt-6 items-center">
//           <Text className="text-yellow-500 font-bold">Descargar PDF</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// function DetailSection({ title, content }) {
//   if (!content) return null;
//   return (
//     <View className="mb-4">
//       <Text className="text-black font-bold text-lg mb-2">{title}</Text>
//       <Text className="text-gray-700 leading-6">{content}</Text>
//     </View>
//   );
// }