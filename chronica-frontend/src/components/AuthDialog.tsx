'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { Mail, User, Lock, UserPlus, LogIn, Eye, EyeOff, X } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { register, login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    name: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData);
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerData);
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent 
        className="max-w-md p-0 overflow-hidden bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-3xl"
        showCloseButton={false}
      >
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>
          
          <div className="relative z-10 p-8">
            {/* Custom Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-20"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
            
            <DialogHeader className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Selamat Datang
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-lg mt-2">
                Masuk atau daftar untuk melanjutkan ke Chronica
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 rounded-2xl p-1 mb-8">
                <TabsTrigger 
                  value="login" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Masuk
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Daftar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmailOrUsername" className="text-sm font-medium text-gray-700">
                      Email atau Username
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="loginEmailOrUsername"
                        value={loginData.emailOrUsername}
                        onChange={(e) => setLoginData({ ...loginData, emailOrUsername: e.target.value })}
                        placeholder="Masukkan email atau username"
                        className="pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginPassword" className="text-sm font-medium text-gray-700">
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
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="Masukkan password"
                        className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="text-red-600 text-sm font-medium">{error}</div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0"
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

              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className="text-sm font-medium text-gray-700">
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
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="nama@email.com"
                        className="pl-10 h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerUsername" className="text-sm font-medium text-gray-700">
                      Username *
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="registerUsername"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        placeholder="username_anda"
                        className="pl-10 h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                        required
                        minLength={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerName" className="text-sm font-medium text-gray-700">
                      Nama Lengkap
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="registerName"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        placeholder="Nama lengkap Anda"
                        className="pl-10 h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="text-sm font-medium text-gray-700">
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
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="text-red-600 text-sm font-medium">{error}</div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0"
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