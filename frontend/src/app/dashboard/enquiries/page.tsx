'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Package } from 'lucide-react';
import { api } from '../../../lib/api';
import { Enquiry } from '../../../types';
import { timeAgo } from '../../../lib/utils';
import { useAuthStore } from '../../../stores/auth-store';

export default function SupplierEnquiriesPage() {
  const { user } = useAuthStore();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchEnquiries = async () => {
    try {
      const res: any = await api.enquiries.getSupplierEnquiries();
      const list = res.enquiries || [];
      setEnquiries(list);
      if (list.length > 0 && !selectedEnquiry) {
        setSelectedEnquiry(list[0]);
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !replyMessage.trim()) return;

    setIsSending(true);
    try {
      const enquiryId = selectedEnquiry.id || (selectedEnquiry as any)._id;
      const updated: any = await api.enquiries.reply(enquiryId, replyMessage.trim());

      setSelectedEnquiry(updated);
      setEnquiries((prev) =>
        prev.map((item) => ((item.id || (item as any)._id) === enquiryId ? updated : item)),
      );
      setReplyMessage('');
    } catch (err) {
      console.error('Error replying:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">Customer Enquiries Inbox</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Answer buyer questions regarding vehicle model fitment and engine code match.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 bg-white border border-neutral-200 rounded-3xl animate-pulse" />
      ) : enquiries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs min-h-[500px]">
          {/* Left List (5 cols) */}
          <div className="md:col-span-5 border-r border-neutral-200 divide-y divide-neutral-100 overflow-y-auto max-h-[600px]">
            {enquiries.map((enq) => {
              const isSelected =
                (selectedEnquiry?.id || (selectedEnquiry as any)?._id) === (enq.id || (enq as any)._id);
              return (
                <button
                  key={enq.id || (enq as any)._id}
                  onClick={() => setSelectedEnquiry(enq)}
                  className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                    isSelected ? 'bg-orange-50/50' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center p-1 flex-shrink-0">
                    {enq.product?.images?.[0] ? (
                      <img
                        src={enq.product.images[0]}
                        alt=""
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-neutral-900 truncate">
                        {enq.buyer?.fullName || 'Potential Buyer'}
                      </span>
                      <span className="text-[10px] text-neutral-400">{timeAgo(enq.updatedAt || enq.createdAt)}</span>
                    </div>
                    <p className="text-xs text-neutral-600 font-medium truncate">{enq.product?.title}</p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {enq.messages?.[enq.messages.length - 1]?.message || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Chat View (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between bg-neutral-50/50">
            {selectedEnquiry ? (
              <>
                <div className="p-4 bg-white border-b border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">
                        {selectedEnquiry.buyer?.fullName || 'Buyer'}
                      </h4>
                      <p className="text-[11px] text-neutral-500 truncate">
                        Regarding: <span className="font-semibold text-neutral-800">{selectedEnquiry.product?.title}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-700">
                    {selectedEnquiry.status}
                  </span>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[420px]">
                  {selectedEnquiry.messages?.map((msg, i) => {
                    const senderId = typeof msg.sender === 'object' ? ((msg.sender as any)?._id || (msg.sender as any)?.id) : msg.sender;
                    const isSupplierMsg = senderId === (user?.id || (user as any)?._id);
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${isSupplierMsg ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isSupplierMsg
                              ? 'bg-orange-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-xs shadow-2xs'
                          }`}
                        >
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-neutral-400 mt-1 px-1">
                          {timeAgo(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-neutral-200 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Reply with engine compatibility or pricing..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyMessage.trim()}
                    className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="m-auto text-center p-8 text-neutral-400 text-xs">
                Select an enquiry to reply to customer.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-3xl p-8 space-y-3 shadow-xs">
          <MessageSquare className="w-12 h-12 text-neutral-400 mx-auto" />
          <h4 className="text-sm font-bold text-neutral-800">No Customer Enquiries Yet</h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            When buyers ask questions about your parts or vehicle compatibility, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
