"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Modal from "@/components/Modal";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { Product } from "@/data/products";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSession, setModalSession] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openModal = (product?: Product) => {
    setSelectedProduct(product ?? null);
    setModalSession((current) => current + 1);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Navbar onOpenModal={openModal} />
      <main className="flex-1">
        <Hero onOpenModal={openModal} />
        <ProductGrid onOpenModal={openModal} />
        <HowItWorks />
        <FAQ />
      </main>
      <Footer />
      <Modal
        key={modalSession}
        isOpen={isModalOpen}
        onClose={closeModal}
        product={selectedProduct}
      />
    </>
  );
}
