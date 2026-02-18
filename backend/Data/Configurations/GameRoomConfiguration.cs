using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TyperacerAPI.Entities;

namespace TyperacerAPI.Data.Configurations;

public class GameRoomConfiguration : IEntityTypeConfiguration<GameRoom>
{
    public void Configure(EntityTypeBuilder<GameRoom> builder)
    {
        builder.ToTable("GameRooms");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.RoomCode)
            .IsRequired()
            .HasMaxLength(6);

        builder.Property(r => r.HostUsername)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.HostConnectionId)
            .HasMaxLength(100);

        builder.Property(r => r.GuestUsername)
            .HasMaxLength(50);

        builder.Property(r => r.GuestConnectionId)
            .HasMaxLength(100);

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasIndex(r => r.RoomCode)
            .IsUnique()
            .HasFilter("\"Status\" = 'Waiting' OR \"Status\" = 'Playing'");

        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.CreatedAt);
    }
}
