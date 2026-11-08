"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/app/components/optimath/Header";
import { Hero } from "@/app/components/optimath/Hero";
import { ModuleCards, MODULES_CONFIG, ModuleData } from "@/app/components/optimath/ModuleCards";
import { SingleInequalityLab } from "@/app/components/optimath/SingleInequalityLab";
import { SystemInequalityLab } from "@/app/components/optimath/SystemInequalityLab/SystemInequalityLab";
import { OptimizationLab } from "@/app/components/optimath/OptimizationLab/OptimizationLab";
import { PracticeLab } from "@/app/components/optimath/PracticeLab/PracticeLab";
import { KnowledgeBaseModal } from "@/app/components/optimath/KnowledgeBaseModal";
import { TeacherGuideModal } from "@/app/components/optimath/TeacherGuideModal";
import { UnderDevModal } from "@/app/components/optimath/UnderDevModal";
import { Footer } from "@/app/components/optimath/Footer";
import { LearningMode } from "@/app/types/math";
import { ArrowLeft } from "lucide-react";

export default function OptimathLabPage() {
  const [currentView, setCurrentView] = useState<"home" | "lab" | "system" | "optimization" | "quiz">("home");
  const [learningMode, setLearningMode] = useState<LearningMode>("guided");

  // Modals
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [underDevModule, setUnderDevModule] = useState<ModuleData | null>(null);

  const handleSelectModule = (modId: string) => {
    if (modId === "home") {
      setCurrentView("home");
    } else if (modId === "lab") {
      setLearningMode("guided");
      setCurrentView("lab");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "system") {
      setLearningMode("guided");
      setCurrentView("system");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "optimization") {
      setLearningMode("guided");
      setCurrentView("optimization");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "quiz") {
      setLearningMode("guided");
      setCurrentView("quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modId === "knowledge") {
      setIsKnowledgeModalOpen(true);
    } else {
      const found = MODULES_CONFIG.find((m) => m.id === modId);
      if (found) {
        setUnderDevModule(found);
      }
    }
  };

  const handleStartExplore = () => {
    setLearningMode("guided");
    setCurrentView("lab");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenTeacherGuide = () => {
    setIsTeacherModalOpen(true);
  };

  const handleLaunchTeacherLab = () => {
    setIsTeacherModalOpen(false);
    setLearningMode("teacher");
    setCurrentView("lab");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToLabFromModal = () => {
    setIsKnowledgeModalOpen(false);
    setUnderDevModule(null);
    setLearningMode("guided");
    setCurrentView("lab");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Top Banner: Return to MathSTEP Platform */}
      <div className="bg-[#0B132B] text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between border-b border-white/10">
        <Link
          href="/"
          className="flex items-center gap-1.5 hover:text-white transition-colors text-blue-400 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ MathSTEP</span>
        </Link>
        <span className="hidden sm:inline text-slate-400 text-[11px]">
          Phân hệ phòng học tương tác OPTIMATH LAB · Toán THPT GDPT 2018
        </span>
      </div>

      {/* App Header */}
      <Header
        currentModule={currentView}
        onSelectModule={handleSelectModule}
        onOpenTeacherGuide={handleOpenTeacherGuide}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === "home" ? (
          <>
            {/* Hero Section */}
            <Hero onStartExplore={handleStartExplore} onOpenTeacherGuide={handleOpenTeacherGuide} />

            {/* 5 Modules Navigation */}
            <ModuleCards onSelectModule={handleSelectModule} />
          </>
        ) : currentView === "lab" ? (
          /* Single Inequality Interactive Laboratory (Module 2) */
          <SingleInequalityLab
            initialLearningMode={learningMode}
            onBackToHome={() => setCurrentView("home")}
          />
        ) : currentView === "system" ? (
          /* System of Inequalities Interactive Laboratory (Module 3) */
          <SystemInequalityLab
            initialLearningMode={learningMode}
            onBackToHome={() => setCurrentView("home")}
          />
        ) : currentView === "optimization" ? (
          /* Linear Programming & Optimization Laboratory (Module 4) */
          <OptimizationLab
            initialLearningMode={learningMode}
            onBackToHome={() => setCurrentView("home")}
          />
        ) : (
          /* Practice, Step-by-Step Assessment & Personalization Center (Module 5) */
          <PracticeLab
            initialLearningMode={learningMode}
            onBackToHome={() => setCurrentView("home")}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onGoToLab={handleGoToLabFromModal}
      />

      <TeacherGuideModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onOpenTeacherLab={handleLaunchTeacherLab}
      />

      <UnderDevModal
        module={underDevModule}
        isOpen={!!underDevModule}
        onClose={() => setUnderDevModule(null)}
        onGoToLab={handleGoToLabFromModal}
      />
    </div>
  );
}
