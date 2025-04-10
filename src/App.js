import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import "./App.css";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [nom, setNom] = useState("");
  const [avisTexte, setAvisTexte] = useState("");
  const [avisLien, setAvisLien] = useState("");
  const [membres, setMembres] = useState([]);
  const [avis, setAvis] = useState([]);
  const [activeTab, setActiveTab] = useState("avis");
  const [showLogout, setShowLogout] = useState(false);
  const [showMembreDetails, setShowMembreDetails] = useState(false);
  const [membreDetails, setMembreDetails] = useState(null);

  useEffect(() => {
    const fetchMembres = async () => {
      const membresRef = collection(db, "membres");
      const snapshot = await getDocs(membresRef);
      setMembres(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchMembres();
  }, []);

  useEffect(() => {
    const fetchAvis = async () => {
      const avisRef = collection(db, "avis");
      const snapshot = await getDocs(avisRef);
      setAvis(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchAvis();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowLogout(false);
  };

  const ajouterAvis = async () => {
    if (!avisTexte || !avisLien) return;
    await addDoc(collection(db, "avis"), {
      texte: avisTexte,
      lien: avisLien,
      donneA: "",
      donnePar: user?.displayName || user?.email,
    });
    setAvisTexte("");
    setAvisLien("");
  };

  const attribuerAvis = async (idAvis, membreId) => {
    const avisRef = doc(db, "avis", idAvis);
    const membre = membres.find((m) => m.id === membreId);
    if (membre) {
      await updateDoc(avisRef, {
        donneA: membre.id, // Assurez-vous de stocker l'ID du membre
      });
      setAvis((prev) =>
        prev.map((a) =>
          a.id === idAvis
            ? {
                ...a,
                donneA: membre.id, // Mettez à jour aussi l'état local avec l'ID
                donnePar: user?.displayName || user?.email,
              }
            : a
        )
      );
    }
  };

  const supprimerAvis = async (id) => {
    await deleteDoc(doc(db, "avis", id));
    const snapshot = await getDocs(collection(db, "avis"));
    setAvis(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const ajouterMembre = async () => {
    if (!nom) return;
    await addDoc(collection(db, "membres"), { nom });
    setNom("");
  };

  const handleMembreDoubleClick = (membreId) => {
    const avisAttribues = avis.filter((a) => a.donneA === membreId); // Vérifiez les avis attribués par ID
    console.log("Avis attribués à ce membre:", avisAttribues); // Affiche les avis dans la console pour vérifier
    setMembreDetails({ membreId, avis: avisAttribues });
    setShowMembreDetails(true);
  };

  const closeMembreDetails = () => {
    setShowMembreDetails(false);
    setMembreDetails(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 font-sans">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">
            Bienvenue, {user?.displayName || user?.email}
          </h1>
          <div className="relative">
            <button
              onClick={() => setShowLogout(!showLogout)}
              className="w-10 h-10 bg-blue-600 text-white rounded-full font-bold text-lg flex items-center justify-center"
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
            </button>
            {showLogout && (
              <button
                onClick={handleLogout}
                className="absolute top-12 right-0 bg-red-500 text-white px-3 py-1 rounded shadow"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {["avis", "membres", "ajouterMembre", "ajouterAvis"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {tab === "avis"
                ? "Avis"
                : tab === "membres"
                ? "Membres"
                : tab === "ajouterMembre"
                ? "Ajouter Membre"
                : "Ajouter Avis"}
            </button>
          ))}
        </div>

        {activeTab === "avis" && (
          <div className="space-y-4">
            {avis.map((a) => (
              <div key={a.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <p className="font-semibold">{a.texte}</p>
                <p className="text-blue-600 text-sm mb-2">{a.lien}</p>
                <select
                  onChange={(e) => attribuerAvis(a.id, e.target.value)}
                  className="border rounded px-2 py-1 w-full mb-2"
                >
                  <option value="">Attribuer à un membre</option>
                  {membres.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </select>
                {a.donneA && (
                  <p className="text-sm text-gray-600">
                    Donné à <b>{membres.find((m) => m.id === a.donneA)?.nom}</b>{" "}
                    par <b>{a.donnePar}</b>
                  </p>
                )}
                <button
                  onClick={() => supprimerAvis(a.id)}
                  className="text-red-500 text-sm mt-1 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "membres" && (
          <div className="space-y-2">
            {membres.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center bg-gray-100 p-2 rounded cursor-pointer"
                onDoubleClick={() => handleMembreDoubleClick(m.id)}
              >
                <p>{m.nom}</p>
                <button
                  onClick={() => supprimerAvis(m.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "ajouterMembre" && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nom du membre"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
            <button
              onClick={ajouterMembre}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Ajouter
            </button>
          </div>
        )}

        {activeTab === "ajouterAvis" && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Lien"
              value={avisLien}
              onChange={(e) => setAvisLien(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
            <textarea
              placeholder="Texte de l'avis"
              value={avisTexte}
              onChange={(e) => setAvisTexte(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
            <button
              onClick={ajouterAvis}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Ajouter l'avis
            </button>
          </div>
        )}

        {showMembreDetails && membreDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold">
                Avis attribués à{" "}
                {membres.find((m) => m.id === membreDetails.membreId)?.nom}
              </h3>
              <ul className="space-y-2">
                {membreDetails.avis.map((a) => (
                  <li key={a.id} className="border p-2 rounded">
                    <p>{a.texte}</p>
                    <p className="text-sm text-blue-600">{a.lien}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={closeMembreDetails}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
