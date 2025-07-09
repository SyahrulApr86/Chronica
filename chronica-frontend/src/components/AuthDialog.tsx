"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import {
  Mail,
  User,
  Lock,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { register, login, isLoading, error, setError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    username: "",
    name: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData.emailOrUsername, loginData.password);
      onClose();
    } catch {
      // Error handled by store
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(
        registerData.email,
        registerData.username,
        registerData.password,
        registerData.name
      );
      onClose();
    } catch {
      // Error handled by store
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setError(null); // Clear any errors when closing dialog
      onClose();
    }
  };

  const handleTabChange = () => {
    setError(null); // Clear errors when switching tabs
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto p-0 bg-white/90 backdrop-blur-2xl border-0 shadow-3xl rounded-[2rem] sm:max-h-[95vh]"
        showCloseButton={false}
      >
        <div className="relative">
          {/* Enhanced Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-pink-500/15 rounded-[2rem]"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-white/20 via-white/10 to-transparent rounded-[2rem] pointer-events-none"></div>

          <div className="relative z-10 p-6 sm:p-10">
            {/* Enhanced Custom Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 rounded-2xl hover:bg-white/20 backdrop-blur-sm transition-all duration-300 z-20 group border border-white/10"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5 text-gray-500 hover:text-gray-700 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <DialogHeader className="text-center mb-6 sm:mb-10">
              <div className="mx-auto mb-4 sm:mb-6 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 animate-pulse"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </div>
              <DialogTitle className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 sm:mb-3 tracking-tight">
                Selamat Datang
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm sm:text-xl font-light leading-relaxed px-2">
                Masuk atau daftar untuk melanjutkan ke{" "}
                <span className="font-semibold text-purple-600">Chronica</span>
              </DialogDescription>
            </DialogHeader>

            <Tabs
              defaultValue="login"
              className="w-full"
              onValueChange={handleTabChange}
            >
              <TabsList className="grid w-full grid-cols-2 bg-white/30 backdrop-blur-sm rounded-3xl p-1 sm:p-2 mb-6 sm:mb-10 border border-white/20 shadow-lg h-12 sm:h-16 items-center">
                <TabsTrigger
                  value="login"
                  className="h-10 sm:h-12 rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl text-gray-600 text-sm sm:text-base font-semibold transition-all duration-300 hover:bg-white/20 flex items-center justify-center"
                >
                  <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  Masuk
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="h-10 sm:h-12 rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl text-gray-600 text-sm sm:text-base font-semibold transition-all duration-300 hover:bg-white/20 flex items-center justify-center"
                >
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  Daftar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 sm:space-y-6">
                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="loginEmailOrUsername"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email atau Username
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="loginEmailOrUsername"
                        value={loginData.emailOrUsername}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            emailOrUsername: e.target.value,
                          })
                        }
                        placeholder="Masukkan email atau username"
                        className="pl-12 h-12 sm:h-14 rounded-2xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white/80 transition-all duration-300 text-sm sm:text-base shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="loginPassword"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="loginPassword"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Masukkan password"
                        className="pl-12 pr-12 h-12 sm:h-14 rounded-2xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white/80 transition-all duration-300 text-sm sm:text-base shadow-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <X className="h-4 w-4 text-red-500" />
                          </div>
                        </div>
                        <div className="text-red-700 text-sm font-medium leading-relaxed">
                          {error}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-[1.02] transition-all duration-300 border-0 font-semibold text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Loading...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-5 w-5" />
                        Masuk ke Akun
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 sm:space-y-6">
                <form
                  onSubmit={handleRegister}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="registerEmail"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email *
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="registerEmail"
                        type="email"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        placeholder="nama@email.com"
                        className="pl-12 h-12 sm:h-14 rounded-2xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/20 focus:bg-white/80 transition-all duration-300 text-sm sm:text-base shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="registerUsername"
                      className="text-sm font-medium text-gray-700"
                    >
                      Username *
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="registerUsername"
                        value={registerData.username}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            username: e.target.value,
                          })
                        }
                        placeholder="username_anda"
                        className="pl-12 h-12 sm:h-14 rounded-2xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/20 focus:bg-white/80 transition-all duration-300 text-sm sm:text-base shadow-sm"
                        required
                        minLength={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="registerName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Nama Lengkap
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="registerName"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Nama lengkap Anda"
                        className="pl-12 h-12 sm:h-14 rounded-2xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/20 focus:bg-white/80 transition-all duration-300 text-sm sm:text-base shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="registerPassword"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password *
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="registerPassword"
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Minimal 6 karakter"
                        className="pl-12 pr-12 h-12 sm:h-14 rounded-2xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/20 focus:bg-white/80 transition-all duration-300 text-sm sm:text-base shadow-sm"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowRegisterPassword(!showRegisterPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showRegisterPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <X className="h-4 w-4 text-red-500" />
                          </div>
                        </div>
                        <div className="text-red-700 text-sm font-medium leading-relaxed">
                          {error}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-300 border-0 font-semibold text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Loading...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Buat Akun Baru
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
